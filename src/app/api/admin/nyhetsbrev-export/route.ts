import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subs = await prisma.shopNewsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { subscribedAt: "desc" },
    select: { email: true, source: true, subscribedAt: true },
  });
  const header = "E-post,Källa,Datum\n";
  const rows = subs.map(s => `${s.email},${s.source},${s.subscribedAt.toISOString()}`).join("\n");
  const csv = header + rows;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nyhetsbrev-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
