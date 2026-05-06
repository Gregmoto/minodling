import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CheckoutForm } from "./CheckoutForm";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kassa – Butik | Minodling" };

export default async function KassaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/butik/kassa");
  }

  const [profile, navUser] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, email: true, fullName: true },
    }),
    getNavUser(user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Butik", href: "/butik" },
              { name: "Varukorg", href: "/butik/varukorg" },
              { name: "Kassa", href: "/butik/kassa" },
            ]}
            className="mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kassa</h1>
          <CheckoutForm profile={{ email: profile?.email, fullName: profile?.fullName }} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
