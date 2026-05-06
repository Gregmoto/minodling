import prisma from "./prisma";

async function getResendKey(): Promise<string | null> {
  try {
    const row = await prisma.shopSetting.findUnique({ where: { key: "resend_api_key" } });
    return row?.value ?? null;
  } catch { return null; }
}

async function getSenderEmail(): Promise<string> {
  try {
    const row = await prisma.shopSetting.findUnique({ where: { key: "resend_sender_email" } });
    return row?.value ?? "noreply@minodling.se";
  } catch { return "noreply@minodling.se"; }
}

interface OrderConfirmationData {
  to: string;
  fullName: string;
  orderId: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; totalPrice: number }>;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
}

function formatSEK(ore: number): string {
  return `${(ore / 100).toFixed(2).replace(".", ",")} kr`;
}

function buildOrderConfirmationHtml(data: OrderConfirmationData): string {
  const itemRows = data.items.map(i =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${i.productName}</td>
     <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center">${i.quantity}</td>
     <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right">${formatSEK(i.totalPrice)}</td></tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><title>Orderbekräftelse</title></head>
<body style="font-family:sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;margin-bottom:24px">
    <h1 style="color:#16a34a;font-size:24px">Tack för din beställning, ${data.fullName}!</h1>
    <p style="color:#6b7280">Order #${data.orderId.slice(0, 8).toUpperCase()}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
    <thead><tr style="background:#f9fafb">
      <th style="text-align:left;padding:8px 0;font-size:12px;color:#6b7280">Produkt</th>
      <th style="text-align:center;padding:8px 0;font-size:12px;color:#6b7280">Antal</th>
      <th style="text-align:right;padding:8px 0;font-size:12px;color:#6b7280">Pris</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div style="text-align:right;border-top:2px solid #e5e7eb;padding-top:12px">
    <p style="color:#6b7280;font-size:14px">Delsumma: ${formatSEK(data.subtotal)}</p>
    ${data.discountAmount > 0 ? `<p style="color:#16a34a;font-size:14px">Rabatt: -${formatSEK(data.discountAmount)}</p>` : ""}
    <p style="color:#6b7280;font-size:14px">Frakt: ${data.shippingAmount === 0 ? "Gratis" : formatSEK(data.shippingAmount)}</p>
    <p style="font-weight:bold;font-size:18px">Totalt: ${formatSEK(data.totalAmount)}</p>
  </div>
  <hr style="margin:24px 0;border-color:#e5e7eb">
  <p style="color:#6b7280;font-size:12px;text-align:center">Minodling Butik &bull; <a href="https://www.minodling.se/butik" style="color:#16a34a">minodling.se/butik</a></p>
</body></html>`;
}

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  const apiKey = await getResendKey();
  if (!apiKey) {
    console.log("[Email] Resend API key not configured – skipping order confirmation to", data.to);
    return;
  }
  const from = await getSenderEmail();
  const html = buildOrderConfirmationHtml(data);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: data.to,
        subject: `Orderbekräftelse #${data.orderId.slice(0, 8).toUpperCase()} – Minodling`,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[Email] Resend error:", err);
    } else {
      console.log("[Email] Order confirmation sent to", data.to);
    }
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}

export async function sendAdminOrderNotification(orderId: string, email: string, fullName: string, totalAmount: number): Promise<void> {
  const apiKey = await getResendKey();
  if (!apiKey) {
    console.log("[Email] Resend API key not configured – skipping admin notification");
    return;
  }
  // Get admin email from settings
  let adminEmail = "info@minodling.se";
  try {
    const row = await prisma.shopSetting.findUnique({ where: { key: "shop_contact_email" } });
    if (row?.value) adminEmail = row.value;
  } catch { /* use default */ }

  const from = await getSenderEmail();
  const formatSEKLocal = (ore: number) => `${(ore / 100).toFixed(2).replace(".", ",")} kr`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: adminEmail,
        subject: `Ny order #${orderId.slice(0, 8).toUpperCase()} – ${fullName} – ${formatSEKLocal(totalAmount)}`,
        html: `<p>Ny order mottagen!</p><p>Kund: ${fullName} (${email})</p><p>Belopp: ${formatSEKLocal(totalAmount)}</p><p><a href="https://www.minodling.se/admin/butik/ordrar/${orderId}">Visa order</a></p>`,
      }),
    });
  } catch (err) {
    console.error("[Email] Admin notification failed:", err);
  }
}
