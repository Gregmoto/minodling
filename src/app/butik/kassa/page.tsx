import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getNavUser } from "@/lib/nav-user";
import { ShopNavbarServer } from "@/components/shop/ShopNavbarServer";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CheckoutForm } from "./CheckoutForm";
import prisma from "@/lib/prisma";

export const metadata: Metadata = { title: "Kassa – Butik | Minodling" };

export default async function KassaPage() {
  const user = await getCurrentUser();

  const [profile, navUser] = await Promise.all([
    user ? prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, email: true, fullName: true },
    }).catch(() => null) : Promise.resolve(null),
    getNavUser(user?.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <ShopNavbarServer user={navUser} />

      <main className="flex-1 bg-cream-50 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Butik",     href: "/butik" },
              { name: "Varukorg",  href: "/butik/varukorg" },
              { name: "Kassa",     href: "/butik/kassa" },
            ]}
            className="mb-6"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Kassa</h1>
          <CheckoutForm
            profile={{
              email:    profile?.email ?? user?.email ?? null,
              fullName: profile?.fullName ?? null,
            }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
