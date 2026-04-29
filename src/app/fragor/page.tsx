export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeDate } from "@/lib/utils";
import { HelpCircle, MessageCircle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Frågor & Svar – Odlingshjälp",
  description: "Få svar på dina odlingsfrågor från erfarna svenska odlare. Ställ en fråga eller hjälp andra i Minodlings Q&A.",
};

export default async function FragorPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kategori?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const kategori = params.kategori;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const questions = await prisma.question.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(kategori ? { category: kategori } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      author: { select: { username: true, fullName: true, avatarUrl: true } },
    },
  }).catch(() => []);

  const navUser = user ? { id: user.id, username: user.email ?? "användare", displayName: null, avatarUrl: null } : null;

  const filters = [
    { label: "Alla", value: "" },
    { label: "Öppna", value: "open" },
    { label: "Besvarade", value: "answered" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-10">
          <Breadcrumbs items={[{ name: "Frågor & Svar", href: "/fragor" }]} />

          <div className="mt-6 mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Frågor & Svar</h1>
              </div>
              <p className="text-gray-500">Få hjälp av Sveriges odlingscommunity.</p>
            </div>
            {user && (
              <Link
                href="/fragor/ny"
                className="px-4 py-2 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors"
              >
                + Ställ en fråga
              </Link>
            )}
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {filters.map((f) => {
              const active = (status ?? "") === f.value;
              const href = f.value ? `/fragor?status=${f.value}` : "/fragor";
              return (
                <Link
                  key={f.value}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-sage-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Inga frågor hittades.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <Link key={q.id} href={`/fragor/${q.id}`}>
                  <Card hover className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {q.status === "answered" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <HelpCircle className="h-4 w-4 text-gray-300 shrink-0" />
                        )}
                        <h2 className="text-sm font-semibold text-gray-900 line-clamp-1">{q.title}</h2>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">{q.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Avatar src={q.author.avatarUrl} fallback={q.author.username} size="xs" />
                          @{q.author.username}
                        </div>
                        <span>·</span>
                        <span>{formatRelativeDate(q.createdAt)}</span>
                        {q.category && (
                          <>
                            <span>·</span>
                            <Badge variant="outline" size="sm">{q.category}</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {q.answersCount}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
