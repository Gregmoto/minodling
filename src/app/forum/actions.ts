"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

// ── Poänghjälp ────────────────────────────────────────────────────
async function awardPoints(userId: string, points: number, reason: string, refType?: string, refId?: string) {
  await Promise.all([
    prisma.profile.update({ where: { id: userId }, data: { points: { increment: points } } }),
    prisma.pointTransaction.create({
      data: { userId, points, reason, referenceType: refType, referenceId: refId },
    }),
  ]);
}

// ── Skapa inlägg ─────────────────────────────────────────────────
export async function createPost(formData: FormData) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) throw new Error("Profil saknas");

  const title    = (formData.get("title") as string).trim();
  const content  = (formData.get("content") as string).trim();
  const category = (formData.get("category") as string | null) || null;
  const postType = (formData.get("postType") as string) || "general";
  const imageUrl = (formData.get("imageUrl") as string | null) || null;

  if (!title || title.length < 3) throw new Error("Titel måste vara minst 3 tecken");
  if (!content || content.length < 10) throw new Error("Innehåll måste vara minst 10 tecken");

  const post = await prisma.post.create({
    data: { userId: profile.id, title, content, category, postType, imageUrl, status: "published" },
  });

  await awardPoints(profile.id, 10, "Skapade ett inlägg", "post", post.id);

  revalidatePath("/forum");
  redirect(`/forum/${post.id}`);
}

// ── Ladda upp bild till inlägg ────────────────────────────────────
export async function uploadPostImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const user = await requireAuth();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "Ingen fil vald" };
  if (file.size > 10 * 1024 * 1024) return { error: "Max 10 MB" };
  if (!file.type.startsWith("image/")) return { error: "Endast bilder" };

  const supabase = await createServerClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `posts/${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("posts").upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("posts").getPublicUrl(path);
  return { url: data.publicUrl };
}

// ── Gilla / avilla inlägg ─────────────────────────────────────────
export async function toggleLike(postId: string): Promise<{ liked: boolean; count: number }> {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) throw new Error("Profil saknas");

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: profile.id } },
  });

  if (existing) {
    // Ta bort like
    await prisma.postLike.delete({ where: { postId_userId: { postId, userId: profile.id } } });
    const post = await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
      select: { likesCount: true, userId: true },
    });
    // Ta bort poäng från inläggsskrivaren
    if (post.userId !== profile.id) {
      await awardPoints(post.userId, -2, "Like borttagen", "post", postId);
    }
    revalidatePath(`/forum/${postId}`);
    return { liked: false, count: Math.max(0, post.likesCount) };
  } else {
    // Lägg till like
    await prisma.postLike.create({ data: { postId, userId: profile.id } });
    const post = await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true, userId: true },
    });
    // Ge poäng till inläggsskrivaren (men inte om man gillar sig själv)
    if (post.userId !== profile.id) {
      await awardPoints(post.userId, 2, "Fick en like", "post", postId);
    }
    revalidatePath(`/forum/${postId}`);
    return { liked: true, count: post.likesCount };
  }
}

// ── Spara / ta bort sparad post ───────────────────────────────────
export async function toggleSave(postId: string): Promise<{ saved: boolean }> {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) throw new Error("Profil saknas");

  const existing = await prisma.savedPost.findUnique({
    where: { postId_userId: { postId, userId: profile.id } },
  });

  if (existing) {
    await prisma.savedPost.delete({ where: { postId_userId: { postId, userId: profile.id } } });
    revalidatePath(`/forum/${postId}`);
    return { saved: false };
  } else {
    await prisma.savedPost.create({ data: { postId, userId: profile.id } });
    revalidatePath(`/forum/${postId}`);
    return { saved: true };
  }
}

// ── Följ / sluta följa användare ──────────────────────────────────
export async function toggleFollow(targetProfileId: string): Promise<{ following: boolean }> {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile || profile.id === targetProfileId) throw new Error("Ogiltig förfrågan");

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: profile.id, followingId: targetProfileId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: profile.id, followingId: targetProfileId } },
    });
    return { following: false };
  } else {
    await prisma.follow.create({ data: { followerId: profile.id, followingId: targetProfileId } });
    return { following: true };
  }
}

// ── Lägg till kommentar ───────────────────────────────────────────
export async function addComment(postId: string, content: string, parentId?: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) throw new Error("Profil saknas");
  if (!content.trim() || content.length < 2) throw new Error("Kommentaren är för kort");

  const comment = await prisma.postComment.create({
    data: {
      postId,
      userId: profile.id,
      content: content.trim(),
      parentId: parentId || null,
      status: "published",
    },
  });

  await prisma.post.update({
    where: { id: postId },
    data: { commentsCount: { increment: 1 } },
  });

  await awardPoints(profile.id, 3, "Kommenterade ett inlägg", "comment", comment.id);

  revalidatePath(`/forum/${postId}`);
}

// ── Radera inlägg (admin/mod/ägare) ──────────────────────────────
export async function deletePost(postId: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, role: true },
  });
  if (!profile) throw new Error("Profil saknas");

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
  if (!post) throw new Error("Inlägg saknas");

  const isOwner = post.userId === profile.id;
  const isMod = ["admin", "moderator"].includes(profile.role);
  if (!isOwner && !isMod) throw new Error("Inte behörig");

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/forum");
  redirect("/forum");
}

// ── Dölj inlägg (mod/admin) ───────────────────────────────────────
export async function hidePost(postId: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { role: true } });
  if (!profile || !["admin", "moderator"].includes(profile.role)) throw new Error("Inte behörig");

  await prisma.post.update({ where: { id: postId }, data: { status: "hidden" } });
  revalidatePath("/forum");
  revalidatePath(`/forum/${postId}`);
}

// ── Radera kommentar (mod/admin/ägare) ────────────────────────────
export async function deleteComment(commentId: string, postId: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, role: true },
  });
  if (!profile) throw new Error("Profil saknas");

  const comment = await prisma.postComment.findUnique({ where: { id: commentId }, select: { userId: true } });
  if (!comment) throw new Error("Kommentar saknas");

  const isOwner = comment.userId === profile.id;
  const isMod = ["admin", "moderator"].includes(profile.role);
  if (!isOwner && !isMod) throw new Error("Inte behörig");

  await prisma.postComment.delete({ where: { id: commentId } });
  await prisma.post.update({ where: { id: postId }, data: { commentsCount: { decrement: 1 } } });
  revalidatePath(`/forum/${postId}`);
}
