export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { questionMetadata, faqSchema, truncateDescription } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeDate } from "@/lib/utils";
import { MessageCircle, CheckCircle2, Eye } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [question, settings] = await Promise.all([
    prisma.question.findUnique({ where: { id }, select: { title: true, content: true } }),
    getSettings(),
  ]);
  if (!question) return { title: "Fråga hittades inte" };
  return questionMetadata(question, settings, `/fragor/${id}`);
}

export default async function FragaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [question, settings] = await Promise.all([
    prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, fullName: true, avatarUrl: true } },
        answers: {
          where: { status: "published" },
          include: { author: { select: { username: true, fullName: true, avatarUrl: true } } },
          orderBy: [{ isBestAnswer: "desc" }, { likesCount: "desc" }],
        },
      },
    }),
    getSettings(),
  ]);

  if (!question) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const navUser = user ? { id: user.id, username: user.email ?? "användare", displayName: null, avatarUrl: null } : null;

  // FAQ schema om det finns svar
  const faqData = question.answers.length > 0
    ? faqSchema(question.answers.map((a) => ({
        question: question.title,
        answer: truncateDescription(a.content, 500),
      })).slice(0, 1))
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-10 max-w-3xl">
          <Breadcrumbs
            items={[
              { name: "Frågor & Svar", href: "/fragor" },
              { name: question.title, href: `/fragor/${id}` },
            ]}
            seoCanonical={settings.seoCanonical}
          />
          {faqData && <JsonLd data={faqData} />}

          <div className="mt-8 space-y-6">
            {/* Frågan */}
            <Card>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {question.category && <Badge variant="outline">{question.category}</Badge>}
                <Badge variant={question.status === "answered" ? "success" : "default"}>
                  {question.status === "answered" ? "Besvarad" : "Öppen"}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                  <Eye className="h-3.5 w-3.5" /> {question.viewsCount} visningar
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{question.content}</p>

              {question.imageUrl && (
                <img
                  src={question.imageUrl}
                  alt={`Bild till frågan: ${question.title}`}
                  className="mt-4 rounded-xl w-full object-cover max-h-72"
                />
              )}

              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                <Avatar
                  src={question.author.avatarUrl}
                  fallback={question.author.fullName ?? question.author.username}
                  size="sm"
                />
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">@{question.author.username}</span>{" "}
                  · {formatRelativeDate(question.createdAt)}
                </div>
              </div>
            </Card>

            {/* Svar */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                {question.answers.length} svar
              </h2>

              {question.answers.length === 0 ? (
                <Card>
                  <p className="text-center text-gray-400 py-8">
                    Ingen har svarat än. Vet du svaret?{" "}
                    <Link href="/auth/login" className="text-green-700 hover:underline">
                      Logga in för att svara
                    </Link>
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {question.answers.map((a) => (
                    <Card key={a.id} className={a.isBestAnswer ? "border-green-200 bg-green-50/30" : ""}>
                      {a.isBestAnswer && (
                        <div className="flex items-center gap-1.5 text-green-700 text-xs font-semibold mb-3">
                          <CheckCircle2 className="h-4 w-4" /> Bästa svar
                        </div>
                      )}
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{a.content}</p>
                      {a.imageUrl && (
                        <img
                          src={a.imageUrl}
                          alt={`Svar av @${a.author.username}`}
                          className="mt-3 rounded-xl w-full object-cover max-h-56"
                        />
                      )}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                        <Avatar
                          src={a.author.avatarUrl}
                          fallback={a.author.fullName ?? a.author.username}
                          size="sm"
                        />
                        <div className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">@{a.author.username}</span>{" "}
                          · {formatRelativeDate(a.createdAt)}
                        </div>
                        {a.likesCount > 0 && (
                          <span className="ml-auto text-xs text-gray-400">
                            👍 {a.likesCount}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link href="/fragor" className="text-sm text-green-700 hover:text-green-800 transition-colors">
                ← Alla frågor
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
