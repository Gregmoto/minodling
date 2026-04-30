"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
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
  revalidatePath("/fragor");
}

export async function updateQuestionStatus(questionId: string, status: string) {
  await requireAdmin();
  await prisma.question.update({ where: { id: questionId }, data: { status } });
  revalidatePath("/admin/fragor");
  revalidatePath("/fragor");
}

export async function deleteAnswer(answerId: string) {
  await requireAdmin();
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: { questionId: true, question: { select: { slug: true } } },
  });
  await prisma.answer.delete({ where: { id: answerId } });
  if (answer) {
    await prisma.question.update({
      where: { id: answer.questionId },
      data: { answersCount: { decrement: 1 } },
    });
    revalidatePath(`/fragor/${answer.question.slug}`);
  }
  revalidatePath("/admin/fragor");
}

export async function updateAnswerStatus(answerId: string, status: string) {
  await requireAdmin();
  await prisma.answer.update({ where: { id: answerId }, data: { status } });
  revalidatePath("/admin/fragor");
}

// ── Växter ─────────────────────────────────────────────────────
export async function deletePlant(plantId: string) {
  await requireAdmin();
  const plant = await prisma.plant.findUnique({ where: { id: plantId }, select: { slug: true } });
  await prisma.plant.delete({ where: { id: plantId } });
  revalidatePath("/admin/vaxter");
  revalidatePath("/vaxtdatabas");
  if (plant) revalidatePath(`/vaxtdatabas/${plant.slug}`);
}

export async function createPlant(formData: FormData) {
  await requireAdmin();

  const name  = (formData.get("name") as string).trim();
  const slug  = (formData.get("slug") as string).trim();
  if (!name || !slug) throw new Error("Namn och slug är obligatoriska");

  try {
    await prisma.plant.create({
      data: {
        name,
        slug,
        latinName:       (formData.get("latinName")       as string | null) || null,
        imageUrl:        (formData.get("imageUrl")         as string | null) || null,
        category:        (formData.get("category")         as string | null) || null,
        difficultyLevel: (formData.get("difficultyLevel")  as string | null) || null,
        sowingPeriod:    (formData.get("sowingPeriod")     as string | null) || null,
        plantingPeriod:  (formData.get("plantingPeriod")   as string | null) || null,
        harvestPeriod:   (formData.get("harvestPeriod")    as string | null) || null,
        sunRequirement:  (formData.get("sunRequirement")   as string | null) || null,
        wateringNeeds:   (formData.get("wateringNeeds")    as string | null) || null,
        soilType:        (formData.get("soilType")         as string | null) || null,
        fertilizerNeeds: (formData.get("fertilizerNeeds")  as string | null) || null,
        commonProblems:  (formData.get("commonProblems")   as string | null) || null,
        description:     (formData.get("description")      as string | null) || null,
        seoTitle:        (formData.get("seoTitle")         as string | null) || null,
        seoDescription:  (formData.get("seoDescription")   as string | null) || null,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Unique constraint → slug redan taget
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      throw new Error(`En växt med slug "${slug}" finns redan. Välj ett annat namn.`);
    }
    throw new Error(`Kunde inte spara växten: ${msg}`);
  }

  revalidatePath("/admin/vaxter");
  revalidatePath("/vaxtdatabas");
}

export async function updatePlant(plantId: string, formData: FormData) {
  await requireAdmin();

  const name  = (formData.get("name") as string).trim();
  const slug  = (formData.get("slug") as string).trim();
  if (!name || !slug) throw new Error("Namn och slug är obligatoriska");

  const plant = await prisma.plant.update({
    where: { id: plantId },
    data: {
      name,
      slug,
      latinName:       (formData.get("latinName")       as string | null) || null,
      imageUrl:        (formData.get("imageUrl")         as string | null) || null,
      category:        (formData.get("category")         as string | null) || null,
      difficultyLevel: (formData.get("difficultyLevel")  as string | null) || null,
      sowingPeriod:    (formData.get("sowingPeriod")     as string | null) || null,
      plantingPeriod:  (formData.get("plantingPeriod")   as string | null) || null,
      harvestPeriod:   (formData.get("harvestPeriod")    as string | null) || null,
      sunRequirement:  (formData.get("sunRequirement")   as string | null) || null,
      wateringNeeds:   (formData.get("wateringNeeds")    as string | null) || null,
      soilType:        (formData.get("soilType")         as string | null) || null,
      fertilizerNeeds: (formData.get("fertilizerNeeds")  as string | null) || null,
      commonProblems:  (formData.get("commonProblems")   as string | null) || null,
      description:     (formData.get("description")      as string | null) || null,
      seoTitle:        (formData.get("seoTitle")         as string | null) || null,
      seoDescription:  (formData.get("seoDescription")   as string | null) || null,
    },
    select: { slug: true },
  });

  revalidatePath("/admin/vaxter");
  revalidatePath("/vaxtdatabas");
  revalidatePath(`/vaxtdatabas/${plant.slug}`);
}

// ── Kalender ───────────────────────────────────────────────────
export async function deleteCalendarEntry(id: string) {
  await requireAdmin();
  await prisma.gardenCalendar.delete({ where: { id } });
  revalidatePath("/admin/kalender");
  revalidatePath("/odlingskalender");
}

export async function updateCalendarEntryStatus(id: string, status: "published" | "rejected") {
  await requireAdmin();
  await prisma.gardenCalendar.update({ where: { id }, data: { status } });
  revalidatePath("/admin/kalender");
  revalidatePath("/odlingskalender");
}

export async function createCalendarEntry(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/utils");
  const { monthFromNum } = await import("@/lib/calendar");

  const title  = (formData.get("title") as string).trim();
  const monthN = parseInt(formData.get("month") as string);
  if (!title) throw new Error("Titel krävs");
  if (!monthN || monthN < 1 || monthN > 12) throw new Error("Ogiltig månad");

  const baseSlug = slugify(`${title}-${monthN}`);
  const exists   = await prisma.gardenCalendar.count({ where: { slug: { startsWith: baseSlug } } });
  const slug     = exists > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

  await prisma.gardenCalendar.create({
    data: {
      title,
      slug,
      month:          monthN,
      taskType:       (formData.get("taskType")    as string | null) || null,
      category:       (formData.get("category")    as string | null) || null,
      growingZone:    (formData.get("growingZone") as string | null) || null,
      growingType:    (formData.get("growingType") as string | null) || null,
      description:    (formData.get("description") as string | null)?.trim() || null,
      status:         "published",
      isUserSuggested: false,
    },
  });

  const m = monthFromNum(monthN);
  revalidatePath("/admin/kalender");
  revalidatePath("/odlingskalender");
  if (m) revalidatePath(`/odlingskalender/${m.slug}`);
}

export async function updateCalendarEntry(id: string, formData: FormData) {
  await requireAdmin();
  const { monthFromNum } = await import("@/lib/calendar");

  const title  = (formData.get("title") as string).trim();
  const monthN = parseInt(formData.get("month") as string);
  if (!title) throw new Error("Titel krävs");

  const entry = await prisma.gardenCalendar.update({
    where: { id },
    data: {
      title,
      month:       monthN,
      taskType:    (formData.get("taskType")    as string | null) || null,
      category:    (formData.get("category")    as string | null) || null,
      growingZone: (formData.get("growingZone") as string | null) || null,
      growingType: (formData.get("growingType") as string | null) || null,
      description: (formData.get("description") as string | null)?.trim() || null,
      status:      (formData.get("status")      as string) || "published",
    },
    select: { month: true },
  });

  const m = monthFromNum(entry.month);
  revalidatePath("/admin/kalender");
  revalidatePath("/odlingskalender");
  if (m) revalidatePath(`/odlingskalender/${m.slug}`);
}

// ── Guider ─────────────────────────────────────────────────────
export async function toggleGuidePublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.guide.update({ where: { id }, data: { published } });
  revalidatePath("/admin/guider");
  revalidatePath("/guider");
}

export async function deleteGuide(id: string) {
  await requireAdmin();
  const g = await prisma.guide.findUnique({ where: { id }, select: { slug: true } });
  await prisma.guide.delete({ where: { id } });
  revalidatePath("/admin/guider");
  revalidatePath("/guider");
  if (g) revalidatePath(`/guider/${g.slug}`);
  redirect("/admin/guider");
}

export async function createGuide(formData: FormData) {
  await requireAdmin();
  const title          = (formData.get("title")          as string).trim();
  const slug           = (formData.get("slug")           as string).trim();
  const excerpt        = (formData.get("excerpt")        as string | null)?.trim() || null;
  const content        = (formData.get("content")        as string | null)?.trim() || null;
  const imageUrl       = (formData.get("imageUrl")       as string | null) || null;
  const category       = (formData.get("category")       as string | null) || null;
  const difficultyLevel = (formData.get("difficultyLevel") as string | null) || null;
  const seoTitle       = (formData.get("seoTitle")       as string | null)?.trim() || null;
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() || null;
  const published      = formData.get("published") === "true";
  if (!title || !slug) throw new Error("Titel och slug krävs");
  await prisma.guide.create({ data: { title, slug, excerpt, content, imageUrl, category, difficultyLevel, seoTitle, seoDescription, published } });
  revalidatePath("/admin/guider");
  revalidatePath("/guider");
  redirect("/admin/guider");
}

export async function updateGuide(id: string, formData: FormData) {
  await requireAdmin();
  const title          = (formData.get("title")          as string).trim();
  const slug           = (formData.get("slug")           as string).trim();
  const excerpt        = (formData.get("excerpt")        as string | null)?.trim() || null;
  const content        = (formData.get("content")        as string | null)?.trim() || null;
  const imageUrl       = (formData.get("imageUrl")       as string | null) || null;
  const category       = (formData.get("category")       as string | null) || null;
  const difficultyLevel = (formData.get("difficultyLevel") as string | null) || null;
  const seoTitle       = (formData.get("seoTitle")       as string | null)?.trim() || null;
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() || null;
  const published      = formData.get("published") === "true";
  if (!title || !slug) throw new Error("Titel och slug krävs");
  await prisma.guide.update({ where: { id }, data: { title, slug, excerpt, content, imageUrl, category, difficultyLevel, seoTitle, seoDescription, published } });
  revalidatePath("/admin/guider");
  revalidatePath("/guider");
  revalidatePath(`/guider/${slug}`);
  redirect("/admin/guider");
}

// ── Kunskapsbank ───────────────────────────────────────────────
export async function toggleArticlePublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.knowledgeArticle.update({ where: { id }, data: { published } });
  revalidatePath("/admin/kunskapsbank");
  revalidatePath("/kunskapsbank");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  const a = await prisma.knowledgeArticle.findUnique({ where: { id }, select: { slug: true } });
  await prisma.knowledgeArticle.delete({ where: { id } });
  revalidatePath("/admin/kunskapsbank");
  revalidatePath("/kunskapsbank");
  if (a) revalidatePath(`/kunskapsbank/${a.slug}`);
  redirect("/admin/kunskapsbank");
}

export async function createArticle(formData: FormData) {
  await requireAdmin();
  const title          = (formData.get("title")          as string).trim();
  const slug           = (formData.get("slug")           as string).trim();
  const excerpt        = (formData.get("excerpt")        as string | null)?.trim() || null;
  const content        = (formData.get("content")        as string | null)?.trim() || null;
  const imageUrl       = (formData.get("imageUrl")       as string | null) || null;
  const category       = (formData.get("category")       as string | null) || null;
  const seoTitle       = (formData.get("seoTitle")       as string | null)?.trim() || null;
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() || null;
  const published      = formData.get("published") === "true";
  if (!title || !slug) throw new Error("Titel och slug krävs");
  await prisma.knowledgeArticle.create({ data: { title, slug, excerpt, content, imageUrl, category, seoTitle, seoDescription, published } });
  revalidatePath("/admin/kunskapsbank");
  revalidatePath("/kunskapsbank");
  redirect("/admin/kunskapsbank");
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAdmin();
  const title          = (formData.get("title")          as string).trim();
  const slug           = (formData.get("slug")           as string).trim();
  const excerpt        = (formData.get("excerpt")        as string | null)?.trim() || null;
  const content        = (formData.get("content")        as string | null)?.trim() || null;
  const imageUrl       = (formData.get("imageUrl")       as string | null) || null;
  const category       = (formData.get("category")       as string | null) || null;
  const seoTitle       = (formData.get("seoTitle")       as string | null)?.trim() || null;
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() || null;
  const published      = formData.get("published") === "true";
  if (!title || !slug) throw new Error("Titel och slug krävs");
  await prisma.knowledgeArticle.update({ where: { id }, data: { title, slug, excerpt, content, imageUrl, category, seoTitle, seoDescription, published } });
  revalidatePath("/admin/kunskapsbank");
  revalidatePath("/kunskapsbank");
  revalidatePath(`/kunskapsbank/${slug}`);
  redirect("/admin/kunskapsbank");
}

// ── Ordlista ───────────────────────────────────────────────────
export async function createGlossaryTerm(formData: FormData) {
  await requireAdmin();
  const term            = (formData.get("term")             as string).trim();
  const slug            = (formData.get("slug")             as string).trim();
  const shortDescription = (formData.get("shortDescription") as string | null)?.trim() || null;
  const fullDescription  = (formData.get("fullDescription")  as string | null)?.trim() || null;
  const imageUrl         = (formData.get("imageUrl")         as string | null) || null;
  const category         = (formData.get("category")         as string | null) || null;
  const relatedRaw       = (formData.get("relatedSlugs")     as string | null) || "";
  const relatedSlugs     = relatedRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const seoTitle         = (formData.get("seoTitle")         as string | null)?.trim() || null;
  const seoDescription   = (formData.get("seoDescription")   as string | null)?.trim() || null;
  const published        = formData.get("published") === "true";
  if (!term || !slug) throw new Error("Term och slug krävs");
  await prisma.glossaryTerm.create({
    data: { term, slug, shortDescription, fullDescription, imageUrl, category, relatedSlugs, seoTitle, seoDescription, published },
  });
  revalidatePath("/admin/ordlista");
  revalidatePath("/ordlista");
  redirect("/admin/ordlista");
}

export async function updateGlossaryTerm(id: string, formData: FormData) {
  await requireAdmin();
  const term            = (formData.get("term")             as string).trim();
  const slug            = (formData.get("slug")             as string).trim();
  const shortDescription = (formData.get("shortDescription") as string | null)?.trim() || null;
  const fullDescription  = (formData.get("fullDescription")  as string | null)?.trim() || null;
  const imageUrl         = (formData.get("imageUrl")         as string | null) || null;
  const category         = (formData.get("category")         as string | null) || null;
  const relatedRaw       = (formData.get("relatedSlugs")     as string | null) || "";
  const relatedSlugs     = relatedRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const seoTitle         = (formData.get("seoTitle")         as string | null)?.trim() || null;
  const seoDescription   = (formData.get("seoDescription")   as string | null)?.trim() || null;
  const published        = formData.get("published") === "true";
  if (!term || !slug) throw new Error("Term och slug krävs");
  await prisma.glossaryTerm.update({
    where: { id },
    data: { term, slug, shortDescription, fullDescription, imageUrl, category, relatedSlugs, seoTitle, seoDescription, published },
  });
  revalidatePath("/admin/ordlista");
  revalidatePath("/ordlista");
  revalidatePath(`/ordlista/${slug}`);
  redirect("/admin/ordlista");
}

export async function toggleGlossaryTermPublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.glossaryTerm.update({ where: { id }, data: { published } });
  revalidatePath("/admin/ordlista");
  revalidatePath("/ordlista");
}

export async function deleteGlossaryTerm(id: string) {
  await requireAdmin();
  const t = await prisma.glossaryTerm.findUnique({ where: { id }, select: { slug: true } });
  await prisma.glossaryTerm.delete({ where: { id } });
  revalidatePath("/admin/ordlista");
  revalidatePath("/ordlista");
  if (t) revalidatePath(`/ordlista/${t.slug}`);
  redirect("/admin/ordlista");
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
