import prisma from "./prisma";

async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.shopSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch { return null; }
}

async function getResendKey(): Promise<string | null> {
  return getSetting("resend_api_key");
}

async function getSenderEmail(): Promise<string> {
  return (await getSetting("resend_sender_email")) ?? "noreply@minodling.se";
}

async function getTrustpilotBcc(): Promise<string | null> {
  return getSetting("trustpilot_bcc_email");
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
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px">${i.productName}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;font-size:14px">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px">${formatSEK(i.totalPrice)}</td>
    </tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><title>Orderbekräftelse</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:0;background:#f9fafb">
  <div style="background:#16a34a;padding:32px 24px;text-align:center">
    <h1 style="color:#fff;font-size:22px;margin:0">Tack för din beställning!</h1>
    <p style="color:#bbf7d0;margin:8px 0 0">Hej ${data.fullName}</p>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px">
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px">
      Order <strong style="color:#111827;font-family:monospace">#${data.orderId.slice(0, 8).toUpperCase()}</strong> är mottagen och behandlas.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="text-align:left;padding:8px 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Produkt</th>
          <th style="text-align:center;padding:8px 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Antal</th>
          <th style="text-align:right;padding:8px 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Pris</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="text-align:right;border-top:2px solid #e5e7eb;padding-top:12px">
      <p style="color:#6b7280;font-size:14px;margin:4px 0">Delsumma: ${formatSEK(data.subtotal)}</p>
      ${data.discountAmount > 0 ? `<p style="color:#16a34a;font-size:14px;margin:4px 0">Rabatt: −${formatSEK(data.discountAmount)}</p>` : ""}
      <p style="color:#6b7280;font-size:14px;margin:4px 0">Frakt: ${data.shippingAmount === 0 ? '<span style="color:#16a34a">Gratis</span>' : formatSEK(data.shippingAmount)}</p>
      <p style="font-weight:700;font-size:20px;color:#111827;margin:12px 0 0">Totalt: ${formatSEK(data.totalAmount)}</p>
    </div>

    <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;text-align:center">
      <p style="color:#166534;font-size:14px;margin:0">Vi återkommer med leveransinformation när ordern är packad.</p>
    </div>

    <div style="margin-top:24px;text-align:center">
      <a href="https://www.minodling.se/butik/order/${data.orderId}"
         style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
        Visa din order
      </a>
    </div>
  </div>
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin:20px 0">
    Minodling Butik &bull; <a href="https://www.minodling.se/butik" style="color:#16a34a">minodling.se/butik</a>
  </p>
</body></html>`;
}

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  const apiKey = await getResendKey();
  if (!apiKey) {
    console.log("[Email] Resend API key saknas – hoppar över orderbekräftelse till", data.to);
    return;
  }
  const [from, trustpilotBcc] = await Promise.all([
    getSenderEmail(),
    getTrustpilotBcc(),
  ]);
  const html = buildOrderConfirmationHtml(data);

  // Build BCC list (Trustpilot if configured)
  const bcc: string[] = [];
  if (trustpilotBcc) bcc.push(trustpilotBcc);

  try {
    const body: Record<string, unknown> = {
      from,
      to: data.to,
      subject: `Orderbekräftelse #${data.orderId.slice(0, 8).toUpperCase()} – Minodling`,
      html,
    };
    if (bcc.length > 0) body.bcc = bcc;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[Email] Resend-fel:", err);
    } else {
      console.log("[Email] Orderbekräftelse skickad till", data.to, bcc.length > 0 ? `(BCC: ${bcc.join(", ")})` : "");
    }
  } catch (err) {
    console.error("[Email] Kunde inte skicka:", err);
  }
}

export async function sendAdminOrderNotification(
  orderId: string,
  email: string,
  fullName: string,
  totalAmount: number,
): Promise<void> {
  const apiKey = await getResendKey();
  if (!apiKey) {
    console.log("[Email] Resend API key saknas – hoppar över adminnotis");
    return;
  }

  let adminEmail = "info@minodling.se";
  try {
    const row = await prisma.shopSetting.findUnique({ where: { key: "shop_contact_email" } });
    if (row?.value) adminEmail = row.value;
  } catch { /* use default */ }

  const from = await getSenderEmail();
  const fmtSEK = (ore: number) => `${(ore / 100).toFixed(2).replace(".", ",")} kr`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: adminEmail,
        subject: `🛒 Ny order #${orderId.slice(0, 8).toUpperCase()} – ${fullName} – ${fmtSEK(totalAmount)}`,
        html: `
          <p><strong>Ny order mottagen!</strong></p>
          <ul>
            <li>Kund: ${fullName} (${email})</li>
            <li>Belopp: ${fmtSEK(totalAmount)}</li>
            <li>Order: #${orderId.slice(0, 8).toUpperCase()}</li>
          </ul>
          <p><a href="https://www.minodling.se/admin/butik/ordrar/${orderId}">Öppna order i admin →</a></p>
        `,
      }),
    });
    console.log("[Email] Adminnotis skickad till", adminEmail);
  } catch (err) {
    console.error("[Email] Adminnotis misslyckades:", err);
  }
}
