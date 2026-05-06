import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.shopCategory.findMany({
    select: { id: true, name: true, slug: true, isActive: true },
    orderBy: { name: "asc" },
  });

  // Rensa cache för alla kategori-sidor
  for (const cat of categories) {
    revalidatePath(`/butik/kategori/${cat.slug}`);
  }
  revalidatePath("/butik");

  return NextResponse.json({ count: categories.length, categories, revalidated: true });
}
