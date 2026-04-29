export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ApproveRejectButtons } from "@/components/admin/ApproveRejectButtons";
import { formatDate } from "@/lib/utils";
import {
  deleteQuestion,
  updateQuestionStatus,
  deleteAnswer,
  updateAnswerStatus,
} from "@/app/admin/actions";

export const metadata: Metadata = { title: "Frågor & svar | Admin" };

const STATUS_FILTERS = [
  { value: "all",      label: "Alla" },
  { value: "open",     label: "Öppna" },
  { value: "answered", label: "Besvarade" },
  { value: "hidden",   label: "Dolda" },
];

function statusBadge(status: string) {
  if (status === "open")     return <Badge variant="success">Öppen</Badge>;
  if (status === "answered") return <Badge variant="warning">Besvarad</Badge>;
  if (status === "hidden")   return <Badge variant="danger">Dold</Badge>;
  if (status === "closed")   return <Badge variant="default">Stängd</Badge>;
  return <Badge>{status}</Badge>;
}

function answerStatusBadge(status: string) {
  if (status === "published") return <Badge variant="success">Publicerat</Badge>;
  if (status === "hidden")    return <Badge variant="danger">Dolt</Badge>;
  return <Badge>{status}</Badge>;
}

export default async function AdminFragorPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tab?: string }>;
}) {
  const params       = await searchParams;
  const activeTab    = params.tab ?? "questions";
  const statusFilter = params.status ?? "all";

  const [questions, answers, hiddenQCount, hiddenACount] = await Promise.all([
    prisma.question.findMany({
      where: statusFilter !== "all" ? { status: statusFilter } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { username: true } } },
    }),
    activeTab === "answers"
      ? prisma.answer.findMany({
          where:
            statusFilter === "hidden"
              ? { status: "hidden" }
              : statusFilter === "all"
              ? {}
              : { status: "published" },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            author:   { select: { username: true } },
            question: { select: { title: true, slug: true } },
          },
        })
      : Promise.resolve([]),
    prisma.question.count({ where: { status: "hidden" } }),
    prisma.answer.count({ where: { status: "hidden" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Frågor &amp; svar</h1>
        <p className="text-gray-500 text-sm mt-1">Hantera frågor och svar från communityn</p>
      </div>

      {(hiddenQCount > 0 || hiddenACount > 0) && (
        <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 text-sm text-orange-800 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <span>
            {hiddenQCount > 0 && <><strong>{hiddenQCount}</strong> dolda frågor.{" "}</>}
            {hiddenACount > 0 && <><strong>{hiddenACount}</strong> dolda svar.</>}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {[
          { value: "questions", label: "Frågor" },
          { value: "answers",   label: "Svar" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/fragor?tab=${tab.value}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? "border-sage-600 text-sage-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ value, label }) => {
          const href =
            value === "all"
              ? `/admin/fragor?tab=${activeTab}`
              : `/admin/fragor?tab=${activeTab}&status=${value}`;
          return (
            <Link
              key={value}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === value
                  ? "bg-sage-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Questions tab */}
      {activeTab === "questions" && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fråga</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Svar</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Visn.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Författare</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs">
                      <Link
                        href={`/fragor/${q.slug}`}
                        className="line-clamp-1 font-medium text-gray-900 hover:text-indigo-700 transition-colors"
                        target="_blank"
                      >
                        {q.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{q.category ?? "–"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={q.answersCount > 0 ? "success" : "default"}>
                        {q.answersCount}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{q.viewsCount}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {q.author?.username ? `@${q.author.username}` : "–"}
                    </td>
                    <td className="px-4 py-3">{statusBadge(q.status)}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {formatDate(q.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {q.status === "hidden" ? (
                          <ApproveRejectButtons
                            approveLabel="Visa"
                            rejectLabel=""
                            onApprove={async () => {
                              "use server";
                              await updateQuestionStatus(q.id, "open");
                            }}
                          />
                        ) : (
                          <ApproveRejectButtons
                            approveLabel=""
                            rejectLabel="Dölj"
                            onReject={async () => {
                              "use server";
                              await updateQuestionStatus(q.id, "hidden");
                            }}
                          />
                        )}
                        <DeleteButton
                          action={async () => {
                            "use server";
                            await deleteQuestion(q.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      Inga frågor hittades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Answers tab */}
      {activeTab === "answers" && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Svar</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Till fråga</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Likes</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Författare</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {answers.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-gray-700">{a.content}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <Link
                        href={`/fragor/${a.question.slug}`}
                        className="line-clamp-1 text-indigo-700 hover:underline text-xs"
                        target="_blank"
                      >
                        {a.question.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.likesCount}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {a.author?.username ? `@${a.author.username}` : "–"}
                    </td>
                    <td className="px-4 py-3">{answerStatusBadge(a.status)}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {formatDate(a.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.status === "hidden" ? (
                          <ApproveRejectButtons
                            approveLabel="Visa"
                            rejectLabel=""
                            onApprove={async () => {
                              "use server";
                              await updateAnswerStatus(a.id, "published");
                            }}
                          />
                        ) : (
                          <ApproveRejectButtons
                            approveLabel=""
                            rejectLabel="Dölj"
                            onReject={async () => {
                              "use server";
                              await updateAnswerStatus(a.id, "hidden");
                            }}
                          />
                        )}
                        <DeleteButton
                          action={async () => {
                            "use server";
                            await deleteAnswer(a.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {answers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      Inga svar hittades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
