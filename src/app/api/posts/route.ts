import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(5, "Titeln måste vara minst 5 tecken").max(200),
  content: z.string().min(20, "Innehållet måste vara minst 20 tecken"),
  categoryId: z.string().uuid().optional(),
  type: z.enum(["DISCUSSION", "TIP", "QUESTION", "HARVEST", "SHOWCASE"]).default("DISCUSSION"),
  tags: z.array(z.string()).max(5).default([]),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const sort = searchParams.get("sort") ?? "new";
  const categorySlug = searchParams.get("kategori");

  const posts = await prisma.post.findMany({
    where: {
      status: { in: ["PUBLISHED", "PINNED"] },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy:
      sort === "top"
        ? { likeCount: "desc" }
        : sort === "hot"
        ? { commentCount: "desc" }
        : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      category: true,
    },
  });

  return NextResponse.json({ posts, page, limit });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.isBanned) {
    return NextResponse.json({ error: "Åtkomst nekad" }, { status: 403 });
  }

  const body = await request.json();
  const result = createPostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { title, content, categoryId, type, tags } = result.data;

  let slug = slugify(title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: content.slice(0, 200).replace(/<[^>]*>/g, ""),
      type,
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: profile.id,
      ...(categoryId ? { categoryId } : {}),
    },
  });

  // Poäng för att skriva inlägg
  await prisma.profile.update({
    where: { id: profile.id },
    data: { points: { increment: 10 } },
  });

  return NextResponse.json({ post }, { status: 201 });
}
