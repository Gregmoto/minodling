import type { Metadata } from "next";
import Link from "next/link";
import { Sprout, Users, MessageSquare, Leaf, Star, ArrowRight, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Minodling – Sveriges odlingscommunity",
  description:
    "Gå med i Sveriges mest engagerade odlingscommunity. Dela tips, ställ frågor och inspirera varandra.",
};

const features = [
  {
    icon: MessageSquare,
    title: "Levande forum",
    description:
      "Diskutera odling med tusentals passionerade odlare. Ställ frågor, dela erfarenheter och hitta inspiration.",
  },
  {
    icon: Leaf,
    title: "Odlingstips",
    description:
      "Expertguider och tips om allt från sådd till skörd. Perfekt för nybörjare och erfarna odlare.",
  },
  {
    icon: Sprout,
    title: "Min odling",
    description:
      "Din personliga odlingsdagbok. Följ dina planters resa från frö till bord och dela dina skördar.",
  },
  {
    icon: Star,
    title: "Poäng & badges",
    description:
      "Samla poäng och badges för ditt engagemang. Tävla och lär av de mest aktiva odlarna.",
  },
];

const stats = [
  { label: "Aktiva odlare", value: "12 000+" },
  { label: "Inlägg & tips", value: "45 000+" },
  { label: "Kategorier", value: "24" },
  { label: "Nya inlägg/dag", value: "120+" },
];

const categories = [
  { name: "Grönsaker", slug: "gronsaker", emoji: "🥕", count: 8420 },
  { name: "Frukt & bär", slug: "frukt-bar", emoji: "🍓", count: 4200 },
  { name: "Örter", slug: "orter", emoji: "🌿", count: 3100 },
  { name: "Blommor", slug: "blommor", emoji: "🌸", count: 5600 },
  { name: "Kompost", slug: "kompost", emoji: "♻️", count: 1800 },
  { name: "Växthuset", slug: "vaxthuSet", emoji: "🏠", count: 2900 },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={null} />

      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-hero border-b border-sage-100">
          <div className="container-main section-padding">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="success" size="md" className="mb-6 inline-flex">
                🌱 Välkommen till odlarnas community
              </Badge>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance leading-tight">
                Odla mer,{" "}
                <span className="text-green-600">dela mer,</span>{" "}
                skörda mer
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-10 text-balance leading-relaxed">
                Gå med i Sveriges mest engagerade odlingscommunity. Dela tips, ställ frågor
                och hitta inspiration från tusentals passionerade odlare.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      Min dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register">
                      <Button size="lg" className="w-full sm:w-auto">
                        Gå med gratis <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/forum">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Utforska forumet
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-10 border-t border-sage-200">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-700 font-display">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Funktioner */}
        <section className="section-padding bg-white">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Allt du behöver som odlare
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Från nybörjare till erfaren odlare – Minodling har verktyg och community
                för hela din odlingsresa.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} hover className="text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Kategorier */}
        <section className="section-padding bg-cream-50">
          <div className="container-main">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  Utforska ämnen
                </h2>
                <p className="text-gray-600">Hitta precis det du söker</p>
              </div>
              <Link href="/forum" className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-medium hover:text-green-800 transition-colors">
                Se alla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/forum?kategori=${cat.slug}`}
                  className="group"
                >
                  <Card hover className="text-center py-6 px-4">
                    <div className="text-3xl mb-3">{cat.emoji}</div>
                    <div className="font-medium text-sm text-gray-800 group-hover:text-green-700 transition-colors">
                      {cat.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {cat.count.toLocaleString("sv-SE")} inlägg
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA-sektion */}
        <section className="section-padding bg-green-600">
          <div className="container-main text-center">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Users className="h-6 w-6 text-green-200" />
                <span className="text-green-200 font-medium">Gå med 12 000+ odlare</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
                Klar att börja din odlingsresa?
              </h2>
              <p className="text-green-100 text-lg mb-8 leading-relaxed">
                Det är helt gratis att gå med. Skapa ett konto på 30 sekunder och börja
                dela din passion för odling.
              </p>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 focus-visible:ring-white"
                >
                  Skapa gratis konto <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Senaste från forumet – placeholder */}
        <section className="section-padding bg-white">
          <div className="container-main">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Populärt nu</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-900">
                  Senaste diskussioner
                </h2>
              </div>
              <Link href="/forum" className="text-sm text-green-700 font-medium hover:text-green-800 flex items-center gap-1 transition-colors">
                Se alla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-sage-100 rounded-2xl border border-sage-100 bg-white overflow-hidden">
              {[
                {
                  title: "Mina tomater vissnar trots regelbunden vattning – vad är fel?",
                  author: "trädgårdsmästaren",
                  category: "Grönsaker",
                  comments: 23,
                  time: "2 tim sedan",
                },
                {
                  title: "Tips för att hålla sniglar borta från salladen?",
                  author: "odlarnybörjare",
                  category: "Grönsaker",
                  comments: 41,
                  time: "4 tim sedan",
                },
                {
                  title: "Min kompost är klar – dela era recept på bokashi!",
                  author: "kompostfantasten",
                  category: "Kompost",
                  comments: 17,
                  time: "6 tim sedan",
                },
                {
                  title: "Första skörden av jordgubbar 2025 🍓",
                  author: "bärälskaren",
                  category: "Frukt & bär",
                  comments: 56,
                  time: "8 tim sedan",
                },
              ].map((post, i) => (
                <Link
                  key={i}
                  href="/forum"
                  className="flex items-start gap-4 p-4 sm:p-5 hover:bg-sage-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="success" size="sm">{post.category}</Badge>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>@{post.author}</span>
                      <span>·</span>
                      <span>{post.comments} svar</span>
                      <span>·</span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-green-600 mt-1 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
