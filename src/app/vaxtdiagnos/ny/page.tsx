export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { DiagnosisForm } from "@/components/diagnos/DiagnosisForm";

export const metadata: Metadata = { title: "Skicka växtproblem – Växtdiagnos" };

export default async function NyDiagnosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const navProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const plants = await prisma.plant.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/vaxtdiagnos" className="text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Skicka in växtproblem</h1>
              <p className="text-sm text-gray-500 mt-0.5">Ladda upp en bild och beskriv problemet – communityn hjälper dig</p>
            </div>
          </div>

          {/* Tips-banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
            <p className="font-medium mb-1">💡 Tips för bättre diagnos</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700">
              <li>Fotografera nära problemet (blad, stam, rötter)</li>
              <li>Beskriv när problemet uppstod och hur snabbt det spridit sig</li>
              <li>Nämn vattnings- och gödslingsrutin om relevant</li>
            </ul>
          </div>

          <Card>
            <DiagnosisForm plants={plants} />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
