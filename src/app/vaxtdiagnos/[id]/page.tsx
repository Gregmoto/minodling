export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Trash2, Shield } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { PROBLEM_TYPES, STATUS_LABELS } from "../constants";
import { addDiagnosisComment, markAsSolution, deleteDiagnosisComment, deleteDiagnosis } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = await prisma.plantDiagnosis.findUnique({ where: { id }, select: { description: true, plantName: true } });
  if (!d) return { title: "Diagnos hittades inte" };
  return { title: `${d.plantName ? `${d.plantName} – ` : ""}Växtdiagnos` };
}

export default async function DiagnosDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [diagnosis, supabase] = await Promise.all([
    prisma.plantDiagnosis.findUnique({
      where: { id },
      include: {
        profile: { select: { id: true, username: true, avatarUrl: true, role: true } },
        plant:   { select: { name: true, slug: true } },
        comments: {
          orderBy: [{ isSolution: "desc" }, { createdAt: "asc" }],
          include: {
            profile: { select: { id: true, username: true, avatarUrl: true, role: true } },
          },
        },
      },
    }),
    createClient(),
  ]);

  if (!diagnosis) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  const navProfile = user ? await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  }) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const isOwner  = navProfile?.id === diagnosis.profileId;
  const isAdmin  = navProfile?.role === "admin" || navProfile?.role === "moderator";
  const canAct   = isOwner || isAdmin;

  const problemInfo = PROBLEM_TYPES.find((p) => p.value === diagnosis.problemType);
  const statusInfo  = STATUS_LABELS[diagnosis.status] ?? STATUS_LABELS["open"];
  const plantLabel  = diagnosis.plant?.name ?? diagnosis.plantName;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/vaxtdiagnos" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              {plantLabel ? `Problem med ${plantLabel}` : "Växtproblem"}
            </h1>
          </div>

          {/* Diagnos-kort */}
          <Card className="mb-6 overflow-hidden p-0">
            {/* Bild */}
            <div className="relative h-96">
              <Image src={diagnosis.imageUrl} alt="Växtproblem" fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm ${
                  diagnosis.status === "resolved" ? "text-green-700" :
                  diagnosis.status === "diagnosed" ? "text-amber-700" : "text-blue-700"
                }`}>
                  {statusInfo.label}
                </span>
                {problemInfo && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700">
                    {problemInfo.emoji} {problemInfo.label}
                  </span>
                )}
              </div>
              {/* AI-placeholder badge */}
              <div className="absolute bottom-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                  🤖 AI-diagnos kommer snart
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              {plantLabel && (
                <p className="text-sm font-medium text-sage-700 mb-2">
                  🌱 {diagnosis.plant ? (
                    <Link href={`/vaxtdatabas/${diagnosis.plant.slug}`} className="hover:underline">{plantLabel}</Link>
                  ) : plantLabel}
                </p>
              )}
              <p className="text-gray-800 leading-relaxed">{diagnosis.description}</p>

              {/* AI-fält (tomma nu, redo för framtiden) */}
              {diagnosis.aiDiagnosis && (
                <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                  <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    🤖 AI-diagnos
                    {diagnosis.aiConfidence && (
                      <span className="normal-case font-normal text-violet-500">
                        ({Math.round(diagnosis.aiConfidence * 100)}% säker)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-violet-900">{diagnosis.aiDiagnosis}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  {diagnosis.profile.avatarUrl ? (
                    <Image src={diagnosis.profile.avatarUrl} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 text-xs font-bold">
                      {diagnosis.profile.username[0].toUpperCase()}
                    </div>
                  )}
                  <span>Frågad av <span className="font-medium text-gray-600">{diagnosis.profile.username}</span></span>
                  <span>· {formatDate(diagnosis.createdAt)}</span>
                </div>
                {canAct && (
                  <form action={async () => { "use server"; await deleteDiagnosis(id); }}>
                    <button type="submit" className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> Ta bort
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Card>

          {/* Kommentarer */}
          <div className="space-y-4 mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              {diagnosis.comments.length > 0
                ? `${diagnosis.comments.length} svar från communityn`
                : "Inga svar ännu – bli första att hjälpa!"}
            </h2>

            {diagnosis.comments.map((c) => (
              <div key={c.id} className={`bg-white rounded-2xl border p-4 space-y-2 ${
                c.isSolution ? "border-green-300 bg-green-50" : "border-gray-100"
              }`}>
                {c.isSolution && (
                  <div className="flex items-center gap-1.5 text-green-700 text-xs font-semibold mb-2">
                    <CheckCircle2 className="h-4 w-4" /> Markerat som lösning
                  </div>
                )}
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{c.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {c.profile.avatarUrl ? (
                      <Image src={c.profile.avatarUrl} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 text-xs font-bold">
                        {c.profile.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-600">{c.profile.username}</span>
                    {c.isExpert && (
                      <span className="flex items-center gap-0.5 text-violet-600">
                        <Shield className="h-3 w-3" /> Expert
                      </span>
                    )}
                    <span>· {formatDate(c.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Markera som lösning – bara ägaren och admin */}
                    {canAct && !c.isSolution && diagnosis.status !== "resolved" && (
                      <form action={async () => { "use server"; await markAsSolution(c.id, id); }}>
                        <button type="submit" className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Markera som lösning
                        </button>
                      </form>
                    )}
                    {(navProfile?.id === c.profileId || isAdmin) && (
                      <form action={async () => { "use server"; await deleteDiagnosisComment(c.id, id); }}>
                        <button type="submit" className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Svarsformulär */}
          {user ? (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Skriv ett svar</h3>
              <form action={async (formData) => {
                "use server";
                await addDiagnosisComment(id, formData);
              }} className="space-y-3">
                <textarea
                  name="content" required rows={4} maxLength={2000}
                  placeholder="Vad tror du är problemet? Dela med dig av dina erfarenheter..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white resize-none"
                />
                <button type="submit"
                  className="px-5 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
                  Skicka svar
                </button>
              </form>
            </Card>
          ) : (
            <Card className="text-center py-6">
              <p className="text-gray-500 mb-3">Logga in för att svara och hjälpa till</p>
              <Link href="/auth/logga-in"
                className="inline-flex px-5 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
                Logga in
              </Link>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
