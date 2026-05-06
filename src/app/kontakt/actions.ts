"use server";

import prisma from "@/lib/prisma";

interface ContactResult {
  success: boolean;
  error?: string;
}

export async function sendContactForm(formData: FormData): Promise<ContactResult> {
  const name    = (formData.get("name")    as string | null)?.trim() ?? "";
  const email   = (formData.get("email")   as string | null)?.trim() ?? "";
  const subject = (formData.get("subject") as string | null)?.trim() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  if (!name || !email || !message) {
    return { success: false, error: "Vänligen fyll i alla obligatoriska fält." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Ange en giltig e-postadress." };
  }
  if (message.length < 20) {
    return { success: false, error: "Meddelandet är för kort (minst 20 tecken)." };
  }

  // Try to send via Resend if configured
  try {
    const [apiKeyRow, senderRow, contactRow] = await Promise.all([
      prisma.shopSetting.findUnique({ where: { key: "resend_api_key" } }).catch(() => null),
      prisma.shopSetting.findUnique({ where: { key: "resend_sender_email" } }).catch(() => null),
      prisma.shopSetting.findUnique({ where: { key: "shop_contact_email" } }).catch(() => null),
    ]);

    const apiKey     = apiKeyRow?.value?.trim();
    const senderEmail = senderRow?.value?.trim() || "noreply@minodling.se";
    const toEmail    = contactRow?.value?.trim() || "hej@minodling.se";

    if (apiKey) {
      const safeMessage = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111827">
          <div style="background:#16a34a;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">Nytt kontaktmeddelande</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:0">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px">Namn</td><td style="padding:8px 0;font-size:14px;font-weight:600">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">E-post</td><td style="padding:8px 0;font-size:14px"><a href="mailto:${email}" style="color:#16a34a">${email}</a></td></tr>
              ${subject ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Ämne</td><td style="padding:8px 0;font-size:14px">${subject}</td></tr>` : ""}
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
            <p style="color:#374151;font-size:15px;line-height:1.6;white-space:pre-wrap">${safeMessage}</p>
          </div>
        </div>
      `;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: senderEmail,
          to: toEmail,
          reply_to: email,
          subject: `Kontaktformulär: ${subject || `Meddelande från ${name}`}`,
          html,
        }),
      });
    }
    // Whether email is sent or not, we succeed (no DB storage needed for contact form)
    return { success: true };
  } catch (err) {
    console.error("Contact form error:", err);
    // Still return success so user isn't blocked – log the error server-side
    return { success: true };
  }
}
