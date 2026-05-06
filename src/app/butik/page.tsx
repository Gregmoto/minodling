export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sprout, Package, ArrowRight, Leaf, Mail } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/shop/HeroSlider";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { QuickLinks } from "@/components/shop/QuickLinks";
import { CampaignBanner } from "@/components/shop/CampaignBanner";
import { CampaignDual } from "@/components/shop/CampaignDual";
import { NewsletterForm } from "./NewsletterForm";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Butik – Frön & odlingstillbehör | Minodling",
    description:
      "Handla frön, jord och odlingstillbehör i Minodlings butik. Noggrant utvalda produkter för svenska odlare. Snabb leverans.",
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/butik` },
    openGraph: {
      title: "Minodling Butik – Frön & odlingstillbehör",
      description: "Allt du behöver för en rik skörd. Frön, jord och tillbehör för svenska odlare.",
    },
  };
}

// Säsong baserat på aktuell månad
function currentSeason(): { label: string; months: number[] } {
  const m = new Date().getMonth() + 1; // 1–12
  if (m >= 3 && m <= 5) return { label: "Vår",    months: [3, 4, 5] };
  if (m >= 6 && m <= 8) return { label: "Sommar", months: [6, 7, 8] };
  if (m >= 9 && m <= 11) return { label: "Höst",  months: [9, 10, 11] };
  return { label: "Vinter", months: [12, 1, 2] };
}

const productSelect = {
  id: true, slug: true, name: true, shortDescription: true,
  price: true, compareAtPrice: true, imageUrl: true,
  stockQuantity: true, isFeatured: true, difficultyLevel: true, createdAt: true,
  category: { select: { name: true, slug: true } },
} as const;

export default async function ButikPage() {
  const season = currentSeason();

  const [
    slides,
    categories,
    homeLinks,
    homeSections,
    featuredProducts,
    newProducts,
    seasonProducts,
    easyProducts,
    popularProductIds,
    seoRow,
    user,
  ] = await Promise.all([
    prisma.shopSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }).catch(() => []),

    prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, name: true, slug: true, imageUrl: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }).catch(() => []),

    prisma.shopHomeLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }).catch(() => []),

    prisma.shopHomeSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        plant: { select: { id: true, name: true, slug: true } },
      },
    }).catch(() => []),

    // Featured products
    prisma.shopProduct.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: productSelect,
    }).catch(() => []),

    // New products
    prisma.shopProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: productSelect,
    }).catch(() => []),

    // Season products
    prisma.shopProduct.findMany({
      where: {
        isActive: true,
        growingType: { contains: season.label, mode: "insensitive" },
      },
      take: 10,
      select: productSelect,
    }).catch(() => []),

    // Easy/beginner products
    prisma.shopProduct.findMany({
      where: { isActive: true, difficultyLevel: "easy" },
      take: 10,
      select: productSelect,
    }).catch(() => []),

    // Popular (most ordered)
    prisma.shopOrderItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }).catch(() => []),

    // SEO-text längst ner (valfri)
    prisma.shopSetting.findUnique({ where: { key: "shop_seo_text" } }).catch(() => null),

    getCurrentUser(),
  ]);

  const navUser = await getNavUser(user?.id);

  // Hämta populära produkter baserat på ids
  const popularIds = popularProductIds
    .map((p) => p.productId)
    .filter(Boolean) as string[];

  const popularProducts = popularIds.length > 0
    ? await prisma.shopProduct.findMany({
        where: { id: { in: popularIds }, isActive: true },
        select: productSelect,
      }).catch(() => [])
    : [];

  // Sortera populära i samma ordning som groupBy-resultatet
  const sortedPopular = popularIds
    .map((id) => popularProducts.find((p) => p.id === id))
    .filter(Boolean) as typeof popularProducts;

  // Fetch plant-linked products for homeSections with plantId
  const plantSectionIds = homeSections
    .filter((s) => s.sectionType === "plant_feature" && s.plantId)
    .map((s) => s.plantId as string);

  const plantLinkedProductsMap: Record<string, typeof featuredProducts> = {};
  if (plantSectionIds.length > 0) {
    // Kör alla plant-queries parallellt istället för sekventiellt
    const results = await Promise.all(
      plantSectionIds.map((plantId) =>
        prisma.shopProduct.findMany({
          where: { isActive: true, plantLinks: { some: { plantId } } },
          take: 10,
          select: productSelect,
        }).catch(() => [])
      )
    );
    plantSectionIds.forEach((plantId, i) => {
      plantLinkedProductsMap[plantId] = results[i];
    });
  }

  const seoText = seoRow?.value ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-white">

        {/* ── HERO SLIDER ────────────────────────────────── */}
        {slides.length > 0 ? (
          <HeroSlider slides={slides} />
        ) : (
          <section className="bg-gradient-to-br from-sage-800 to-sage-600 py-20">
            <div className="container-main">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-4">
                  <Leaf className="h-4 w-4" /> Minodling Butik
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                  Odla mer med rätt verktyg
                </h1>
                <p className="mt-4 text-lg text-white/80 leading-relaxed max-w-xl">
                  Frön, jord och tillbehör noggrant utvalda för svenska odlare.
                  Allt du behöver för en rik skörd – direkt hem till dörren.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="#kategorier"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-colors"
                  >
                    Utforska sortimentet <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SNABBLÄNKAR ────────────────────────────────── */}
        {homeLinks.length > 0 && (
          <section className="border-b border-gray-100 bg-white">
            <div className="container-main py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Populärt just nu
              </p>
              <QuickLinks links={homeLinks} />
            </div>
          </section>
        )}

        {/* ── SÄSONGSPRODUKTER ────────────────────────────── */}
        {seasonProducts.length > 0 && (
          <section className="py-12 bg-sage-50/40">
            <div className="container-main">
              <div className="mb-1">
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 mb-3">
                  🌱 Nu i säsong
                </span>
              </div>
              <ProductCarousel
                title={`${season.label}ens produkter`}
                subtitle="Perfekt att odla just nu"
                products={seasonProducts}
                ctaText="Se alla produkter"
                ctaHref="/butik/produkter"
              />
            </div>
          </section>
        )}

        {/* ── KATEGORIER ─────────────────────────────────── */}
        {categories.length > 0 && (
          <section id="kategorier" className="py-14">
            <div className="container-main">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Kategorier</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Bläddra bland {categories.length} kategorier
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/butik/kategori/${cat.slug}`} className="group">
                    <div className="bg-white rounded-2xl border border-sage-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                      <div className="relative h-32 bg-sage-50">
                        {cat.imageUrl ? (
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-10 w-10 text-sage-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 text-sm group-hover:text-green-700 transition-colors leading-tight">
                          {cat.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cat._count.products} produkter
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── DYNAMISKA STARTSIDESSEKTIONER ──────────────── */}
        {homeSections.map((section) => {
          if (section.sectionType === "campaign_full") {
            return (
              <CampaignBanner
                key={section.id}
                title={section.title}
                subtitle={section.subtitle}
                content={section.content}
                imageUrl={section.imageUrl}
                buttonText={section.buttonText}
                buttonUrl={section.buttonUrl}
              />
            );
          }

          if (section.sectionType === "campaign_dual") {
            return (
              <CampaignDual
                key={section.id}
                cards={[
                  {
                    title: section.title,
                    subtitle: section.subtitle,
                    imageUrl: section.imageUrl,
                    buttonText: section.buttonText,
                    buttonUrl: section.buttonUrl,
                  },
                  {
                    title: section.title2 ?? "",
                    subtitle: section.subtitle2,
                    imageUrl: section.imageUrl2,
                    buttonText: section.buttonText2,
                    buttonUrl: section.buttonUrl2,
                  },
                ].filter((c) => c.title)}
              />
            );
          }

          if (section.sectionType === "plant_feature" && section.plantId && section.plant) {
            const plantProducts = plantLinkedProductsMap[section.plantId] ?? [];
            if (plantProducts.length === 0) return null;
            return (
              <section key={section.id} className="py-12 bg-emerald-50/30">
                <div className="container-main">
                  <ProductCarousel
                    title={section.title || `Odlar du ${section.plant.name}?`}
                    subtitle={section.subtitle ?? undefined}
                    products={plantProducts}
                    ctaText={section.buttonText ?? undefined}
                    ctaHref={section.buttonUrl ?? undefined}
                  />
                </div>
              </section>
            );
          }

          return null;
        })}

        {/* ── UTVALDA PRODUKTER ───────────────────────────── */}
        {featuredProducts.length > 0 && (
          <section className="py-12">
            <div className="container-main">
              <ProductCarousel
                title="Utvalda produkter"
                subtitle="Handplockat av oss för dig"
                products={featuredProducts}
                ctaText="Se alla"
                ctaHref="/butik/produkter"
              />
            </div>
          </section>
        )}

        {/* ── NYBÖRJARPRODUKTER ───────────────────────────── */}
        {easyProducts.length > 0 && (
          <section className="py-12 bg-emerald-50/40">
            <div className="container-main">
              <ProductCarousel
                title="Nybörjarfavoriter"
                subtitle="Enkla att lyckas med – perfekt att börja odla"
                products={easyProducts}
              />
            </div>
          </section>
        )}

        {/* ── POPULÄRA PRODUKTER ──────────────────────────── */}
        {sortedPopular.length > 0 && (
          <section className="py-12">
            <div className="container-main">
              <ProductCarousel
                title="Populära produkter"
                subtitle="Mest beställda av andra odlare"
                products={sortedPopular}
              />
            </div>
          </section>
        )}

        {/* ── NYA PRODUKTER ───────────────────────────────── */}
        {newProducts.length > 0 && (
          <section className="py-12 bg-gray-50/50">
            <div className="container-main">
              <ProductCarousel
                title="Nyheter i butiken"
                subtitle="Senast inlagda produkter"
                products={newProducts}
                ctaText="Se alla nyheter"
                ctaHref="/butik/produkter?sort=new"
              />
            </div>
          </section>
        )}

        {/* ── TOMT TILLSTÅND ──────────────────────────────── */}
        {featuredProducts.length === 0 && newProducts.length === 0 &&
          seasonProducts.length === 0 && easyProducts.length === 0 && (
          <section className="py-24">
            <div className="container-main text-center">
              <Sprout className="h-16 w-16 text-sage-200 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Sortimentet fylls på snart
              </h2>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Vi håller på att fylla butiken med produkter. Prenumerera på nyhetsbrevet
                för att få besked när vi öppnar.
              </p>
            </div>
          </section>
        )}

        {/* ── NYHETSBREV ──────────────────────────────────── */}
        <section className="py-16 bg-gradient-to-br from-sage-700 to-sage-900">
          <div className="container-main">
            <div className="max-w-2xl mx-auto text-center">
              <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Odlingstips &amp; erbjudanden
              </h2>
              <p className="text-white/75 mb-8 leading-relaxed">
                Prenumerera och få exklusiva erbjudanden, säsongsanpassade odlingstips
                och nyheter direkt i inkorgen. Avprenumerera när du vill.
              </p>
              <div className="max-w-md mx-auto">
                <NewsletterForm variant="dark" />
              </div>
              <p className="text-white/40 text-xs mt-4">
                Inga spammail. Vi värnar om din integritet.
              </p>
            </div>
          </div>
        </section>

        {/* ── SEO-TEXT ────────────────────────────────────── */}
        {seoText && (
          <section className="py-12 border-t border-sage-100">
            <div className="container-main">
              <div className="max-w-3xl mx-auto prose prose-sm prose-gray">
                <div dangerouslySetInnerHTML={{ __html: seoText }} />
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
