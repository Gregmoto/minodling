import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createPostSchema = z.object({
  title:    z.string().min(5, "Titeln måste vara minst 5 tecken").max(200),
  content:  z.string().min(20, "Innehållet måste vara minst 20 tecken"),
  category: z.string().max(100).optional(),
  postType: z.enum(["discussion", "tip", "question", "harvest", "showcase"]).default("discussion"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page     = parseInt(searchParams.get("page")  ?? "1");
  const limit    = parseInt(searchParams.get("limit") ?? "20");
  const sort     = searchParams.get("sort")     ?? "new";
  const category = searchParams.get("kategori") ?? undefined;

  const posts = await prisma.post.findMany({
    where: {
      status: { in: ["published", "pinned"] },
      ...(category ? { category } : {}),
    },
    orderBy:
      sort === "top" ? { likesCount: "desc" }
      : sort === "hot" ? { commentsCount: "desc" }
      : { createdAt: "desc" },
    skip:  (page - 1) * limit,
    take:  limit,
    include: {
      author: { select: { username: true, fullName: true, avatarUrl: true } },
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
  if (!profile) {
    return NextResponse.json({ error: "Åtkomst nekad" }, { status: 403 });
  }

  const body = await request.json();
  const result = createPostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { title, content, category, postType } = result.data;

  const post = await prisma.post.create({
    data: {
      title,
      content,
      category,
      postType,
      status: "published",
      userId: profile.id,
    },
  });

  await prisma.profile.update({
    where: { id: profile.id },
    data:  { points: { increment: 10 } },
  });

  return NextResponse.json({ post }, { status: 201 });
}
