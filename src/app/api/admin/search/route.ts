import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  type Hit = { label: string; href: string; group: string; meta?: string };
  const hits: Hit[] = [];

  const [plants, guides, products, users, posts] = await Promise.all([
    prisma.plant.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { latinName: { contains: q, mode: "insensitive" } }] },
      select: { id: true, name: true, slug: true, latinName: true },
      take: 4,
    }).catch(() => []),

    prisma.guide.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, slug: true },
      take: 4,
    }).catch(() => []),

    prisma.shopProduct.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, price: true },
      take: 4,
    }).catch(() => []),

    prisma.profile.findMany({
      where: { OR: [{ username: { contains: q, mode: "insensitive" } }, { fullName: { contains: q, mode: "insensitive" } }] },
      select: { id: true, username: true, fullName: true },
      take: 3,
    }).catch(() => []),

    prisma.post.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true },
      take: 3,
    }).catch(() => []),
  ]);

  for (const p of plants) {
    hits.push({ label: p.name, href: `/admin/vaxter/${p.slug ?? p.id}`, group: "Växter", meta: p.latinName ?? undefined });
  }
  for (const g of guides) {
    hits.push({ label: g.title, href: `/admin/guider/${g.slug ?? g.id}`, group: "Guider" });
  }
  for (const p of products) {
    hits.push({ label: p.name, href: `/admin/butik/produkter/${p.slug ?? p.id}`, group: "Produkter", meta: p.price ? `${p.price} kr` : undefined });
  }
  for (const u of users) {
    hits.push({ label: u.fullName ?? u.username, href: `/admin/anvandare/${u.id}`, group: "Användare", meta: `@${u.username}` });
  }
  for (const p of posts) {
    hits.push({ label: p.title ?? "(Utan titel)", href: `/admin/inlagg/${p.id}`, group: "Inlägg" });
  }

  return NextResponse.json(hits);
}
