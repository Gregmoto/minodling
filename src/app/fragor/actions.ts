"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { createClient as createServerClient } from "@/lib/supabase/server";

// ── Hjälpfunktion: poäng ─────────────────────────────────────────
async function awardPoints(userId: string, points: number, reason: string, refType?: string, refId?: string) {
  // Transaktion så att saldo och liggare aldrig hamnar i otakt.
  await prisma.$transaction([
    prisma.profile.update({ where: { id: userId }, data: { points: { increment: points } } }),
    prisma.pointTransaction.create({
      data: { userId, points, reason, referenceType: refType, referenceId: refId },
    }),
  ]);
}

// ── Generera unik slug ────────────────────────────────────────────
async function uniqueSlug(title: string, id: string): Promise<string> {
  const base = slugify(title);
  const short = id.slice(0, 8);
  return `${base}-${short}`;
}

// ── Skapa fråga ───────────────────────────────────────────────────
export async function createQuestion(formData: FormData) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) throw new Error("Profil saknas");

  const title    = (formData.get("title")    as string).trim();
  const content  = (formData.get("content")  as string).trim();
  const category = (formData.get("category") as string | null) || null;
  const imageUrl = (formData.get("imageUrl") as string | null) || null;

  if (!title   || title.length   < 10) throw new Error("Titeln måste vara minst 10 tecken");
  if (!content || content.length < 20) throw new Error("Frågan måste vara minst 20 tecken");

  // Create with a temp slug; update with ID-based slug after
  const question = await prisma.question.create({
    data: {
      userId: profile.id,
      title,
      slug:    `tmp-${Date.now()}`,
      content,
      category,
      imageUrl,
      status:  "open",
    },
  });

  const slug = await uniqueSlug(title, question.id);
  await prisma.question.update({ where: { id: question.id }, data: { slug } });

  await awardPoints(profile.id, 5, "Ställde en fråga", "question", question.id);

  revalidatePath("/fragor");
  redirect(`/fragor/${slug}`);
}

// ── Bilduppladdning till frågor ──────────────────────────────────
export async function uploadQuestionImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAuth();
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "Ingen fil vald" };
  if (file.size > 10 * 1024 * 1024) return { error: "Max 10 MB" };
  if (!file.type.startsWith("image/")) return { error: "Endast bilder" };

  const supabase = await createServerClient();
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `questions/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("questions").upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("questions").getPublicUrl(path);
  return { url: data.publicUrl };
}

// ── Svara på fråga ────────────────────────────────────────────────
export async function addAnswer(questionId: string, content: string, imageUrl?: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) throw new Error("Profil saknas");
  if (!content.trim() || content.length < 10) throw new Error("Svaret är för kort (min 10 tecken)");

  const answer = await prisma.answer.create({
    data: {
      questionId,
      userId:   profile.id,
      content:  content.trim(),
      imageUrl: imageUrl || null,
      status:   "published",
    },
  });

  await prisma.question.update({
    where: { id: questionId },
    data:  { answersCount: { increment: 1 } },
  });
  // Flippa bara öppna frågor till "answered" – rör inte dolda/stängda frågor.
  await prisma.question.updateMany({
    where: { id: questionId, status: "open" },
    data:  { status: "answered" },
  });

  await awardPoints(profile.id, 8, "Svarade på en fråga", "answer", answer.id);

  const question = await prisma.question.findUnique({ where: { id: questionId }, select: { slug: true } });
  if (question) revalidatePath(`/fragor/${question.slug}`);
}

// ── Gilla svar ────────────────────────────────────────────────────
export async function toggleAnswerLike(
  answerId: string
): Promise<{ liked: boolean; count: number }> {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) throw new Error("Profil saknas");

  const existing = await prisma.answerLike.findUnique({
    where: { answerId_userId: { answerId, userId: profile.id } },
  });

  if (existing) {
    await prisma.answerLike.delete({ where: { answerId_userId: { answerId, userId: profile.id } } });
    const answer = await prisma.answer.update({
      where: { id: answerId },
      data:  { likesCount: { decrement: 1 } },
      select: { likesCount: true, userId: true, questionId: true },
    });
    if (answer.userId !== profile.id) {
      await awardPoints(answer.userId, -1, "Like på svar borttagen", "answer", answerId);
    }
    const q = await prisma.question.findUnique({ where: { id: answer.questionId }, select: { slug: true } });
    if (q) revalidatePath(`/fragor/${q.slug}`);
    return { liked: false, count: Math.max(0, answer.likesCount) };
  } else {
    await prisma.answerLike.create({ data: { answerId, userId: profile.id } });
    const answer = await prisma.answer.update({
      where: { id: answerId },
      data:  { likesCount: { increment: 1 } },
      select: { likesCount: true, userId: true, questionId: true },
    });
    if (answer.userId !== profile.id) {
      await awardPoints(answer.userId, 1, "Fick en like på svar", "answer", answerId);
    }
    const q = await prisma.question.findUnique({ where: { id: answer.questionId }, select: { slug: true } });
    if (q) revalidatePath(`/fragor/${q.slug}`);
    return { liked: true, count: answer.likesCount };
  }
}

// ── Markera bästa svar ───────────────────────────────────────────
export async function markBestAnswer(questionId: string, answerId: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, role: true },
  });
  if (!profile) throw new Error("Profil saknas");

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { userId: true, bestAnswerId: true, slug: true },
  });
  if (!question) throw new Error("Fråga saknas");

  const isMod = ["admin", "moderator"].includes(profile.role);
  if (question.userId !== profile.id && !isMod) throw new Error("Inte behörig");

  // Unmark old best answer
  if (question.bestAnswerId) {
    await prisma.answer.update({
      where: { id: question.bestAnswerId },
      data:  { isBestAnswer: false },
    });
  }

  // Toggle: if same answer, unmark; else mark new
  if (question.bestAnswerId === answerId) {
    await prisma.question.update({
      where: { id: questionId },
      data:  { bestAnswerId: null, status: "open" },
    });
  } else {
    await prisma.answer.update({
      where: { id: answerId },
      data:  { isBestAnswer: true },
    });
    await prisma.question.update({
      where: { id: questionId },
      data:  { bestAnswerId: answerId, status: "answered" },
    });

    // Award extra points to answer author – bara en gång per svar, annars
    // kan frågeägaren farma poäng genom att markera/avmarkera i loop.
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { userId: true },
    });
    if (answer && answer.userId !== profile.id) {
      const alreadyAwarded = await prisma.pointTransaction.findFirst({
        where: {
          userId: answer.userId,
          referenceType: "answer",
          referenceId: answerId,
          reason: "Bästa svar utsett",
        },
        select: { id: true },
      });
      if (!alreadyAwarded) {
        await awardPoints(answer.userId, 15, "Bästa svar utsett", "answer", answerId);
      }
    }
  }

  revalidatePath(`/fragor/${question.slug}`);
}

// ── Dölj fråga (mod/admin) ───────────────────────────────────────
export async function hideQuestion(questionId: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true },
  });
  if (!profile || !["admin", "moderator"].includes(profile.role)) throw new Error("Inte behörig");

  const q = await prisma.question.update({
    where: { id: questionId },
    data:  { status: "hidden" },
    select: { slug: true },
  });
  revalidatePath("/fragor");
  revalidatePath(`/fragor/${q.slug}`);
}

// ── Dölj svar (mod/admin) ────────────────────────────────────────
export async function hideAnswer(answerId: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true },
  });
  if (!profile || !["admin", "moderator"].includes(profile.role)) throw new Error("Inte behörig");

  await prisma.answer.update({ where: { id: answerId }, data: { status: "hidden" } });
}

// ── Öka visningsräknare ──────────────────────────────────────────
export async function incrementViews(questionId: string) {
  await prisma.question.update({
    where: { id: questionId },
    data:  { viewsCount: { increment: 1 } },
  }).catch(() => {}); // silent fail
}
