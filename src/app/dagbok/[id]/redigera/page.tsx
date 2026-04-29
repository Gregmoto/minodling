export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { EditDiaryForm } from "@/components/diary/EditDiaryForm";

export const metadata: Metadata = { title: "Redigera dagbok – Minodling" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RedigeraDagbokPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirect=/dagbok/${id}/redigera`);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  if (!profile) redirect("/dashboard");

  const navUser = { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role };

  const diary = await prisma.gardenDiary.findUnique({
    where: { id },
    select: {
      id: true, title: true, notes: true, imageUrl: true,
      sowingDate: true, plantingDate: true, harvestDate: true,
      status: true, isPublic: true, userId: true,
    },
  });

  if (!diary || diary.userId !== profile.id) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50 py-8">
        <div className="container-main max-w-2xl">
          <Link
            href={`/dagbok/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sage-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Redigera dagbok</h1>
          <Card>
            <EditDiaryForm diary={diary} />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
