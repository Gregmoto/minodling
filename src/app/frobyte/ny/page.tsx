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
import { ExchangeForm } from "@/components/frobyte/ExchangeForm";

export const metadata: Metadata = { title: "Lägg upp annons – Fröbyte & Plantbyte" };

export default async function NyAnnonsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/logga-in");

  const navProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/frobyte" className="text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lägg upp annons</h1>
              <p className="text-sm text-gray-500 mt-0.5">Byt, ge bort eller sälj till odlare nära dig</p>
            </div>
          </div>
          <Card>
            <ExchangeForm />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
