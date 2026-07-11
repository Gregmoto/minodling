"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// ── Skapa ticket från kontaktformulär ─────────────────────────────

/** Escapa användarstyrd text innan den bäddas in i e-post-HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface ContactResult {
  success: boolean;
  error?: string;
}

export async function sendContactForm(formData: FormData): Promise<ContactResult> {
  const name    = (formData.get("name")    as string | null)?.trim() ?? "";
  const email   = (formData.get("email")   as string | null)?.trim() ?? "";
  const subject = (formData.get("subject") as string | null)?.trim() || null;
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  if (!name || !email || !message) {
    return { success: false, error: "Vänligen fyll i alla obligatoriska fält." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Ange en giltig e-postadress." };
  }
  if (message.length < 10) {
    return { success: false, error: "Meddelandet är för kort." };
  }

  try {
    // Spara ticket i DB
    await prisma.contactTicket.create({
      data: { name, email, subject, message, status: "open" },
    });

    // Skicka e-postnotis till admin om Resend är konfigurerat
    try {
      const [apiKeyRow, senderRow, contactRow] = await Promise.all([
        prisma.shopSetting.findUnique({ where: { key: "resend_api_key" } }).catch(() => null),
        prisma.shopSetting.findUnique({ where: { key: "resend_sender_email" } }).catch(() => null),
        prisma.shopSetting.findUnique({ where: { key: "shop_contact_email" } }).catch(() => null),
      ]);

      const apiKey      = apiKeyRow?.value?.trim();
      const senderEmail = senderRow?.value?.trim() || "noreply@minodling.se";
      const toEmail     = contactRow?.value?.trim() || "hej@minodling.se";

      if (apiKey) {
        const safeMessage = esc(message);
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            from: senderEmail,
            to: toEmail,
            reply_to: email,
            subject: `[Kontakt] ${subject ?? `Meddelande från ${name}`}`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#16a34a;padding:20px;border-radius:10px 10px 0 0">
                <h2 style="color:white;margin:0;font-size:18px">Nytt kontaktärende</h2>
              </div>
              <div style="background:#f9fafb;padding:20px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 10px 10px">
                <p style="margin:0 0 4px;color:#6b7280;font-size:13px">Från</p>
                <p style="margin:0 0 12px;font-weight:600">${esc(name)} &lt;${esc(email)}&gt;</p>
                ${subject ? `<p style="margin:0 0 4px;color:#6b7280;font-size:13px">Ämne</p><p style="margin:0 0 12px">${esc(subject)}</p>` : ""}
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0">
                <p style="white-space:pre-wrap;font-size:14px;color:#374151;line-height:1.6">${safeMessage}</p>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://minodling.se"}/admin/kontakt"
                   style="display:inline-block;padding:10px 20px;background:#16a34a;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
                  Hantera i admin →
                </a>
              </div>
            </div>`,
          }),
        });
      }
    } catch { /* e-post är valfritt */ }

    revalidatePath("/admin/kontakt");
    return { success: true };
  } catch (err) {
    console.error("Contact form error:", err);
    return { success: false, error: "Något gick fel, försök igen lite senare." };
  }
}

// ── Admin: uppdatera ticket-status ────────────────────────────────

export async function updateTicketStatus(id: string, status: string, adminNote?: string) {
  await requireAdmin();
  await prisma.contactTicket.update({
    where: { id },
    data: { status, adminNote: adminNote?.trim() || null },
  });
  revalidatePath("/admin/kontakt");
  revalidatePath(`/admin/kontakt/${id}`);
}

// ── Admin: skicka svar till kund ──────────────────────────────────

export async function replyToTicket(id: string, formData: FormData) {
  await requireAdmin();

  const reply = (formData.get("reply") as string | null)?.trim() ?? "";
  if (!reply) return;

  const ticket = await prisma.contactTicket.findUnique({ where: { id } });
  if (!ticket) return;

  // Markera som stängd och spara svar
  await prisma.contactTicket.update({
    where: { id },
    data: { reply, repliedAt: new Date(), status: "closed" },
  });

  // Skicka svar via Resend
  try {
    const [apiKeyRow, senderRow] = await Promise.all([
      prisma.shopSetting.findUnique({ where: { key: "resend_api_key" } }).catch(() => null),
      prisma.shopSetting.findUnique({ where: { key: "resend_sender_email" } }).catch(() => null),
    ]);

    const apiKey      = apiKeyRow?.value?.trim();
    const senderEmail = senderRow?.value?.trim() || "noreply@minodling.se";

    if (apiKey) {
      const safeReply = esc(reply);
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: senderEmail,
          to: ticket.email,
          subject: `Re: ${ticket.subject ?? "Ditt meddelande till Minodling"}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#16a34a;padding:20px;border-radius:10px 10px 0 0">
              <h2 style="color:white;margin:0;font-size:18px">Svar från Minodling</h2>
            </div>
            <div style="background:#f9fafb;padding:20px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 10px 10px">
              <p style="color:#374151">Hej ${esc(ticket.name)},</p>
              <p style="white-space:pre-wrap;color:#374151;line-height:1.6">${safeReply}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
              <p style="color:#9ca3af;font-size:12px">Ditt ursprungliga meddelande:</p>
              <blockquote style="border-left:3px solid #d1fae5;margin:0;padding-left:12px;color:#6b7280;font-size:13px;white-space:pre-wrap">${esc(ticket.message)}</blockquote>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
              <p style="color:#9ca3af;font-size:12px">Med vänliga hälsningar,<br>Minodling-teamet</p>
            </div>
          </div>`,
        }),
      });
    }
  } catch { /* fortsätt även om e-post misslyckas */ }

  revalidatePath("/admin/kontakt");
  revalidatePath(`/admin/kontakt/${id}`);
}

// ── Admin: radera ticket ──────────────────────────────────────────

export async function deleteTicket(id: string) {
  await requireAdmin();
  await prisma.contactTicket.delete({ where: { id } });
  revalidatePath("/admin/kontakt");
}
