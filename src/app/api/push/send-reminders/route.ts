import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPush, isApnsConfigured } from "@/lib/apns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Skickar push-notiser för påminnelser som förfaller idag.
 *
 * Tänkt att köras en gång per dygn från en Cloudflare Cron Trigger. Skyddad
 * med en delad hemlighet (CRON_SECRET) så att endpointen inte kan triggas
 * utifrån – annars kunde vem som helst spamma användarnas telefoner.
 *
 *   curl -X POST https://minodling.se/api/push/send-reminders \
 *        -H "authorization: Bearer $CRON_SECRET"
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET saknas" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nekad" }, { status: 401 });
  }
  if (!isApnsConfigured()) {
    return NextResponse.json({ error: "APNs är inte konfigurerat" }, { status: 503 });
  }

  // Påminnelsedatum lagras som UTC-midnatt. Jämför mot svensk kalenderdag så
  // att notisen går ut rätt dag oavsett var servern står.
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Stockholm" })
    .format(new Date());
  const dayStart = new Date(`${todayStr}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const due = await prisma.reminder.findMany({
    where: { isCompleted: false, dueDate: { gte: dayStart, lt: dayEnd } },
    select: { id: true, userId: true, title: true, reminderType: true },
  });

  if (due.length === 0) {
    return NextResponse.json({ ok: true, reminders: 0, sent: 0 });
  }

  // Samla per användare så att den som har fem påminnelser får en notis,
  // inte fem.
  const byUser = new Map<string, typeof due>();
  for (const r of due) {
    const list = byUser.get(r.userId) ?? [];
    list.push(r);
    byUser.set(r.userId, list);
  }

  const tokens = await prisma.deviceToken.findMany({
    where: { isActive: true, userId: { in: [...byUser.keys()] } },
    select: { token: true, userId: true },
  });

  let sent = 0;
  let failed = 0;
  const stale: string[] = [];

  for (const { token, userId } of tokens) {
    const items = byUser.get(userId);
    if (!items?.length) continue;

    const first = items[0];
    const message = items.length === 1
      ? { title: "Dags att odla", body: first.title }
      : { title: `${items.length} påminnelser idag`,
          body: `${first.title} och ${items.length - 1} till` };

    const result = await sendPush(token, {
      ...message,
      link: "/paminnelser",
      badge: items.length,
      threadId: "reminders",
    });

    if (result.ok) sent++;
    else {
      failed++;
      if (result.unregistered) stale.push(token);
    }
  }

  // Apple säger att enheten är borta – sluta skicka dit.
  if (stale.length) {
    await prisma.deviceToken.updateMany({
      where: { token: { in: stale } },
      data: { isActive: false },
    });
  }

  return NextResponse.json({
    ok: true,
    reminders: due.length,
    users: byUser.size,
    devices: tokens.length,
    sent,
    failed,
    deactivated: stale.length,
  });
}
