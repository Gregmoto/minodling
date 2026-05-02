import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const type  = req.nextUrl.searchParams.get("type");
  const value = req.nextUrl.searchParams.get("value")?.trim();
  const skip  = req.nextUrl.searchParams.get("skip"); // current id when editing

  if (!type || !value) return NextResponse.json({ exists: false });

  try {
    let existing: { id: string } | null = null;

    if (type === "plant") {
      existing = await prisma.plant.findFirst({
        where: { name: { equals: value, mode: "insensitive" } },
        select: { id: true },
      });
    } else if (type === "guide") {
      existing = await prisma.guide.findFirst({
        where: { title: { equals: value, mode: "insensitive" } },
        select: { id: true },
      });
    } else if (type === "article") {
      existing = await prisma.knowledgeArticle.findFirst({
        where: { title: { equals: value, mode: "insensitive" } },
        select: { id: true },
      });
    } else if (type === "glossary") {
      existing = await prisma.glossaryTerm.findFirst({
        where: { term: { equals: value, mode: "insensitive" } },
        select: { id: true },
      });
    }

    // Om vi redigerar den egna posten räknas det inte som dubblett
    const exists = !!(existing && existing.id !== skip);
    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
