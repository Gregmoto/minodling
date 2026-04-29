export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { NewDiaryForm } from "@/components/diary/NewDiaryForm";

export const metadata: Metadata = { title: "Ny dagbok – Minodling" };

export default async function NyDagbokPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dagbok/ny");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  if (!profile) redirect("/dashboard");

  const navUser = { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role };

  const plants = await prisma.plant.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50 py-8">
        <div className="container-main max-w-2xl">
          <Link
            href="/dagbok"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sage-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Tillbaka till dagboken
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Lägg till växt i dagboken</h1>
          <p className="text-sm text-gray-500 mb-6">
            Välj en växt från databasen eller ange ett eget namn och börja logga din odling.
          </p>
          <Card>
            <NewDiaryForm plants={plants} />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
