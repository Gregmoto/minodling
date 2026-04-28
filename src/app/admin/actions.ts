"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// ── Användare ──────────────────────────────────────────────────
export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();
  await prisma.profile.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/anvandare");
  revalidatePath("/admin/roller");
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  await prisma.profile.delete({ where: { id: userId } });
  revalidatePath("/admin/anvandare");
}

// ── Moderatorbehörigheter ──────────────────────────────────────
export async function upsertModeratorPermission(
  userId: string,
  data: {
    canModeratePosts: boolean;
    canModerateComments: boolean;
    canBanUsers: boolean;
    canManageReports: boolean;
  }
) {
  await requireAdmin();
  await prisma.moderatorPermission.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  revalidatePath("/admin/moderatorer");
}

// ── Inlägg ─────────────────────────────────────────────────────
export async function updatePostStatus(postId: string, status: string) {
  await requireAdmin();
  await prisma.post.update({ where: { id: postId }, data: { status } });
  revalidatePath("/admin/inlagg");
}

export async function deletePost(postId: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/admin/inlagg");
}

// ── Kommentarer ────────────────────────────────────────────────
export async function deleteComment(commentId: string) {
  await requireAdmin();
  await prisma.postComment.delete({ where: { id: commentId } });
  revalidatePath("/admin/kommentarer");
}

export async function updateCommentStatus(commentId: string, status: string) {
  await requireAdmin();
  await prisma.postComment.update({ where: { id: commentId }, data: { status } });
  revalidatePath("/admin/kommentarer");
}

// ── Frågor ─────────────────────────────────────────────────────
export async function deleteQuestion(questionId: string) {
  await requireAdmin();
  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath("/admin/fragor");
}

// ── Växter ─────────────────────────────────────────────────────
export async function deletePlant(plantId: string) {
  await requireAdmin();
  await prisma.plant.delete({ where: { id: plantId } });
  revalidatePath("/admin/vaxter");
}

// ── Kalender ───────────────────────────────────────────────────
export async function deleteCalendarEntry(id: string) {
  await requireAdmin();
  await prisma.gardenCalendar.delete({ where: { id } });
  revalidatePath("/admin/kalender");
}

// ── Guider ─────────────────────────────────────────────────────
export async function toggleGuidePublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.guide.update({ where: { id }, data: { published } });
  revalidatePath("/admin/guider");
}

export async function deleteGuide(id: string) {
  await requireAdmin();
  await prisma.guide.delete({ where: { id } });
  revalidatePath("/admin/guider");
}

// ── Kunskapsbank ───────────────────────────────────────────────
export async function toggleArticlePublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.knowledgeArticle.update({ where: { id }, data: { published } });
  revalidatePath("/admin/kunskapsbank");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await prisma.knowledgeArticle.delete({ where: { id } });
  revalidatePath("/admin/kunskapsbank");
}

// ── Ordlista ───────────────────────────────────────────────────
export async function deleteGlossaryTerm(id: string) {
  await requireAdmin();
  await prisma.glossaryTerm.delete({ where: { id } });
  revalidatePath("/admin/ordlista");
}

// ── Banners ────────────────────────────────────────────────────
export async function toggleBanner(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.banner.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/annonser");
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/annonser");
}

// ── Rapporter ──────────────────────────────────────────────────
export async function updateReportStatus(id: string, status: string) {
  await requireAdmin();
  const profile = await requireAdmin();
  await prisma.report.update({
    where: { id },
    data: { status, handledBy: profile.id },
  });
  revalidatePath("/admin/rapporter");
}

// ── Inställningar ──────────────────────────────────────────────
export async function updateSetting(key: string, value: string) {
  await requireAdmin();
  await prisma.adminSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  revalidatePath("/admin/installningar");
  revalidateTag("settings");
}

export async function updateSettingsBulk(entries: Record<string, string>) {
  await requireAdmin();
  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      prisma.adminSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );
  revalidatePath("/admin/installningar");
  revalidateTag("settings");
}

// ── SEO ────────────────────────────────────────────────────────
export async function upsertSeoSetting(data: {
  pageType: string;
  pageId?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}) {
  await requireAdmin();
  await prisma.seoSetting.upsert({
    where: { pageType_pageId: { pageType: data.pageType, pageId: data.pageId ?? "" } },
    create: data,
    update: data,
  });
  revalidatePath("/admin/seo");
}
