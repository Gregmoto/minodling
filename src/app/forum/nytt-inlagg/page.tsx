export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewPostForm } from "@/components/forum/NewPostForm";

export const metadata: Metadata = { title: "Nytt inlägg – Forum" };

const CATEGORIES = [
  "Grönsaker", "Frukt & bär", "Örter", "Blommor",
  "Balkongsodling", "Växthus", "Kompost & jord",
  "Skadedjur & sjukdomar", "Redskap & teknik", "Övrigt",
];

const POST_TYPES = [
  { value: "general",  label: "💬 Diskussion" },
  { value: "question", label: "❓ Fråga" },
  { value: "tip",      label: "💡 Tips" },
  { value: "harvest",  label: "🌾 Skörd" },
  { value: "photo",    label: "📸 Bild" },
];

export default async function NyttInlaggPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/forum/nytt-inlagg");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  if (!profile) redirect("/dashboard");

  const navUser = {
    id: profile.id,
    username: profile.username,
    displayName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50 py-8">
        <div className="container-main max-w-2xl">
          <div className="mb-6">
            <Link
              href="/forum"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Tillbaka till forumet
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Skapa inlägg</h1>
          </div>

          <Card>
            <NewPostForm
              categories={CATEGORIES}
              postTypes={POST_TYPES}
              currentUsername={profile.username}
              currentUserAvatar={profile.avatarUrl}
            />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
