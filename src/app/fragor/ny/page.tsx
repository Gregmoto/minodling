export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { NewQuestionForm } from "@/components/qa/NewQuestionForm";

export const metadata: Metadata = { title: "Ställ en fråga – Frågor & Svar" };

const CATEGORIES = [
  "Växtproblem", "Skadedjur", "Jord & gödsel", "Växthus",
  "Balkongodling", "Inomhusväxter", "Grönsaker",
  "Kryddor", "Frukt & bär", "Nybörjarfrågor",
];

export default async function NyFragaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/fragor/ny");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  if (!profile) redirect("/dashboard");

  const navUser = { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50 py-8">
        <div className="container-main max-w-2xl">
          <Link href="/fragor" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Tillbaka till frågor
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ställ en fråga</h1>
          <p className="text-sm text-gray-500 mb-6">
            Beskriv ditt problem så detaljerat som möjligt – gärna med bild.
          </p>
          <Card>
            <NewQuestionForm categories={CATEGORIES} />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
