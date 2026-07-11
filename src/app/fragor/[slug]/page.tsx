export const revalidate = 60;
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, MessageCircle, Calendar, Tag, CheckCircle2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AnswerForm } from "@/components/qa/AnswerForm";
import { AnswerLikeButton } from "@/components/qa/AnswerLikeButton";
import { BestAnswerButton } from "@/components/qa/BestAnswerButton";
import { HideContentButton } from "@/components/qa/HideContentButton";
import { incrementViews, hideQuestion, hideAnswer } from "@/app/fragor/actions";
import { formatRelativeDate, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const question = await prisma.question.findUnique({
    where: { slug },
    select: { title: true, content: true, category: true },
  });
  if (!question) return { title: "Fråga hittades inte" };

  const description = question.content.slice(0, 155).replace(/\n/g, " ");
  return {
    title: `${question.title} – Frågor & Svar`,
    description,
    openGraph: {
      title: question.title,
      description,
    },
  };
}

export default async function QuestionPage({ params }: Props) {
  const { slug } = await params;

  const [question, supabaseResult] = await Promise.all([
    prisma.question.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            points: true,
          },
        },
        answers: {
          where: { status: "published" },
          orderBy: [{ isBestAnswer: "desc" }, { likesCount: "desc" }, { createdAt: "asc" }],
          include: {
            author: {
              select: { id: true, username: true, fullName: true, avatarUrl: true, points: true },
            },
            likes: { select: { userId: true } },
          },
        },
      },
    }),
    createClient(),
  ]);

  if (!question || question.status === "hidden") notFound();

  const supabase = supabaseResult;
  const { data: { user } } = await supabase.auth.getUser();

  const profile = user
    ? await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
      })
    : null;

  const navUser = profile
    ? { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role }
    : null;

  const isMod           = profile ? ["admin", "moderator"].includes(profile.role) : false;
  const isQuestionAuthor = profile ? profile.id === question.author.id : false;

  // Öka visningsräknaren – awaita så att skrivningen hinner köra klart på
  // serverless (en fire-and-forget-promise kan annars tappas när svaret flushas).
  await incrementViews(question.id).catch(() => {});

  // FAQ JSON-LD schema if there are answers
  const faqJsonLd = question.answers.length > 0
    ? {
        "@context": "https://schema.org",
        "@type":    "FAQPage",
        mainEntity: question.answers.slice(0, 5).map((a) => ({
          "@type":          "Question",
          name:             question.title,
          acceptedAnswer:   {
            "@type": "Answer",
            text:    a.content.slice(0, 300),
          },
        })),
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        <section className="bg-gradient-to-b from-indigo-50/60 to-cream-50 border-b border-indigo-100/50 py-8">
          <div className="container-main">
            <Breadcrumbs
              items={[
                { name: "Frågor & Svar", href: "/fragor" },
                { name: question.title, href: `/fragor/${slug}` },
              ]}
              className="mb-4"
            />
            <Link
              href="/fragor"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-700 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Alla frågor
            </Link>
          </div>
        </section>

        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* Question card */}
              <Card padding="lg">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {question.category && (
                    <Badge variant="outline" size="sm">
                      <Tag className="h-3 w-3 mr-1" />
                      {question.category}
                    </Badge>
                  )}
                  {question.bestAnswerId && (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Besvarad
                    </Badge>
                  )}
                  {question.status === "open" && !question.bestAnswerId && (
                    <Badge variant="warning" size="sm">Väntar på svar</Badge>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:text-3xl">
                  {question.title}
                </h1>

                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-5">
                  {question.content}
                </p>

                {question.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={question.imageUrl}
                    alt="Bifogad bild till frågan"
                    className="rounded-2xl border border-gray-200 max-h-80 object-cover mb-5"
                  />
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Avatar src={question.author.avatarUrl} fallback={question.author.username} size="sm" />
                    <Link
                      href={`/profil/${question.author.username}`}
                      className="font-medium text-gray-700 hover:text-indigo-700 transition-colors"
                    >
                      {question.author.fullName ?? question.author.username}
                    </Link>
                    {question.author.points > 0 && (
                      <span className="text-xs text-amber-600 font-medium">{question.author.points} p</span>
                    )}
                  </div>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(question.createdAt)}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {question.viewsCount + 1} visningar
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {question.answersCount} svar
                  </span>

                  {/* Mod: hide question */}
                  {isMod && (
                    <HideContentButton
                      label="Dölj fråga"
                      action={async () => {
                        "use server";
                        await hideQuestion(question.id);
                      }}
                    />
                  )}
                </div>
              </Card>

              {/* Answers */}
              {question.answers.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {question.answers.length} {question.answers.length === 1 ? "svar" : "svar"}
                  </h2>
                  <div className="space-y-4">
                    {question.answers.map((answer) => {
                      const userLiked = profile
                        ? answer.likes.some((l) => l.userId === profile.id)
                        : false;

                      return (
                        <Card
                          key={answer.id}
                          padding="lg"
                          className={answer.isBestAnswer ? "ring-2 ring-green-400 ring-offset-1" : ""}
                        >
                          {answer.isBestAnswer && (
                            <div className="flex items-center gap-2 mb-3 text-green-700 text-sm font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              Bästa svar
                            </div>
                          )}

                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                            {answer.content}
                          </p>

                          {answer.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={answer.imageUrl}
                              alt="Bild i svar"
                              className="rounded-xl border border-gray-200 max-h-60 object-cover mb-4"
                            />
                          )}

                          {/* Answer meta */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Avatar src={answer.author.avatarUrl} fallback={answer.author.username} size="xs" />
                              <Link
                                href={`/profil/${answer.author.username}`}
                                className="font-medium text-gray-700 hover:text-indigo-700 transition-colors"
                              >
                                {answer.author.fullName ?? answer.author.username}
                              </Link>
                              {answer.author.points > 0 && (
                                <span className="text-xs text-amber-600 font-medium">{answer.author.points} p</span>
                              )}
                              <span>·</span>
                              <span>{formatRelativeDate(answer.createdAt)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Like button */}
                              {profile ? (
                                <AnswerLikeButton
                                  answerId={answer.id}
                                  initialLiked={userLiked}
                                  initialCount={answer.likesCount}
                                />
                              ) : (
                                answer.likesCount > 0 && (
                                  <span className="text-sm text-gray-400 flex items-center gap-1">
                                    👍 {answer.likesCount}
                                  </span>
                                )
                              )}

                              {/* Best answer button (question author or mod) */}
                              {(isQuestionAuthor || isMod) && (
                                <BestAnswerButton
                                  questionId={question.id}
                                  answerId={answer.id}
                                  isBest={answer.isBestAnswer}
                                />
                              )}

                              {/* Mod: hide answer */}
                              {isMod && (
                                <HideContentButton
                                  label="Dölj svar"
                                  action={async () => {
                                    "use server";
                                    await hideAnswer(answer.id);
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Answer form */}
              {profile ? (
                <Card padding="lg">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Skriv ett svar</h3>
                  <AnswerForm
                    questionId={question.id}
                    currentUsername={profile.username ?? ""}
                    currentUserAvatar={profile.avatarUrl}
                  />
                </Card>
              ) : (
                <Card padding="lg" className="text-center py-8">
                  <MessageCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-4">Logga in för att svara</p>
                  <div className="flex justify-center gap-3">
                    <Link
                      href={`/auth/login?redirect=/fragor/${slug}`}
                      className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Logga in
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Skapa konto
                    </Link>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-5">

                {/* Stats */}
                <Card padding="md">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Statistik</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Visningar</dt>
                      <dd className="font-medium text-gray-900">{question.viewsCount + 1}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Svar</dt>
                      <dd className="font-medium text-gray-900">{question.answersCount}</dd>
                    </div>
                    {question.category && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Kategori</dt>
                        <dd className="font-medium text-gray-900">{question.category}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Ställd</dt>
                      <dd className="font-medium text-gray-900">{formatDate(question.createdAt)}</dd>
                    </div>
                  </dl>
                </Card>

                {/* Back & other categories CTA */}
                <Card padding="md" className="bg-indigo-50 border-indigo-100">
                  <p className="text-sm font-medium text-indigo-900 mb-3">Fler frågor i samma kategori</p>
                  <Link
                    href={question.category ? `/fragor?kategori=${encodeURIComponent(question.category)}` : "/fragor"}
                    className="block w-full text-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    {question.category ? `Se alla i ${question.category}` : "Se alla frågor"}
                  </Link>
                  {user && (
                    <Link
                      href="/fragor/ny"
                      className="block w-full text-center mt-2 px-4 py-2 border border-indigo-200 text-indigo-700 text-sm font-medium rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      Ställ en fråga
                    </Link>
                  )}
                </Card>

              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
