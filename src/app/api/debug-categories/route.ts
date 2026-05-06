import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.shopCategory.findMany({
    select: { id: true, name: true, slug: true, isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ count: categories.length, categories });
}
