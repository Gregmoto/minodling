export const revalidate = 120;

import type { Metadata } from "next";
import Link from "next/link";
import {
  Sprout, Users, MessageSquare, Leaf, BookOpen, ArrowRight,
  Heart, Calendar, Stethoscope, Camera, ShoppingBag, Scan,
  CheckCircle2, TrendingUp, Mail, ChevronRight, Flower2,
  BellRing, Plus, Star,
} from "lucide-react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSignupForm } from "@/app/nyhetsbrev/NewsletterSignupForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeDate } from "@/lib/utils";
import { TopBar } from "./_home/TopBar";
import { PlantsScroll } from "./_home/PlantsScroll";

// ── Metadata ──────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Minodling – Odla smartare från frö till skörd",
  description:
    "Sveriges odlingscommunity med AI-hjälp. Identifiera växter, diagnostisera problem, planera odlingen och handla fröer. Alltid gratis.",
  openGraph: {
    title: "Minodling – Odla smartare från frö till skörd",
    description: "Community, AI-växtanalys, odlingskalender och butik – allt för din odling.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

// ── Månadsnamn ────────────────────────────────────────────────────

const MONTHS_SV = [
  "januari","februari","mars","april","maj","juni",
  "juli","augusti","september","oktober","november","december",
];

const TASK_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  sådd:      { bg: "bg-green-50",  text: "text-green-800",  dot: "bg-green-500"  },
  plantering:{ bg: "bg-blue-50",   text: "text-blue-800",   dot: "bg-blue-500"   },
  skörd:     { bg: "bg-amber-50",  text: "text-amber-800",  dot: "bg-amber-500"  },
  skötsel:   { bg: "bg-purple-50", text: "text-purple-800", dot: "bg-purple-500" },
};

// ── Cachade queries ───────────────────────────────────────────────

const getHomeData = unstable_cache(
  async (month: number) => {
    const [
      plants,
      calendarTips,
      popularPosts,
      memberImages,
      guides,
      shopProducts,
      siteCounts,
      freeShippingRow,
      heroStatsSetting,
    ] = await Promise.all([
      // Populära växter (featured + alphabet)
      prisma.plant.findMany({
        where:   { imageUrl: { not: null } },
        orderBy: { name: "asc" },
        take:    12,
        select:  { id: true, name: true, slug: true, imageUrl: true, difficultyLevel: true, category: true },
      }).catch(() => []),

      // Odlingskalender denna månad
      prisma.gardenCalendar.findMany({
        where:   { month, status: "published" },
        orderBy: { createdAt: "asc" },
        take:    5,
        select:  { id: true, title: true, category: true, taskType: true, description: true, slug: true },
      }).catch(() => []),

      // Populära inlägg
      prisma.post.findMany({
        where:   { status: "published" },
        orderBy: [{ likesCount: "desc" }, { commentsCount: "desc" }],
        take:    4,
        include: { author: { select: { username: true, fullName: true, avatarUrl: true } } },
      }).catch(() => []),

      // Member-bilder
      prisma.post.findMany({
        where:   { status: "published", imageUrl: { not: null } },
        orderBy: { createdAt: "desc" },
        take:    6,
        select:  { id: true, title: true, imageUrl: true, author: { select: { username: true, avatarUrl: true } } },
      }).catch(() => []),

      // Senaste guider
      prisma.guide.findMany({
        where:   { published: true },
        orderBy: { createdAt: "desc" },
        take:    4,
        select:  { id: true, title: true, slug: true, excerpt: true, imageUrl: true, category: true, difficultyLevel: true },
      }).catch(() => []),

      // Featured butiksprodukter
      prisma.shopProduct.findMany({
        where:   { isActive: true, isFeatured: true },
        orderBy: { createdAt: "desc" },
        take:    8,
        select:  { id: true, name: true, slug: true, price: true, compareAtPrice: true, imageUrl: true, shortDescription: true },
      }).catch(() => []),

      // Statistik
      Promise.all([
        prisma.plant.count().catch(() => 0),
        prisma.profile.count().catch(() => 0),
        prisma.guide.count({ where: { published: true } }).catch(() => 0),
      ]),

      // Fri frakt-gräns
      prisma.shopSetting.findUnique({
        where:  { key: "free_shipping_threshold" },
        select: { value: true },
      }).catch(() => null),

      // Hero stats toggle
      prisma.adminSetting.findUnique({
        where:  { key: "hero_stats_visible" },
        select: { value: true },
      }).catch(() => null),
    ]);

    return {
      plants,
      calendarTips,
      popularPosts,
      memberImages,
      guides,
      shopProducts,
      plantCount:  siteCounts[0],
      userCount:   siteCounts[1],
      guideCount:  siteCounts[2],
      freeShippingThreshold: freeShippingRow?.value
        ? parseInt(freeShippingRow.value, 10)
        : 49900,
      heroStatsVisible: heroStatsSetting?.value !== "false",
    };
  },
  ["home-all"],
  { revalidate: 120, tags: ["posts", "plants", "guides", "shop"] },
);

// ── User-specifik data (ej cachad) ────────────────────────────────

async function getUserHomeData(profileId: string) {
  const [reminders, diaries] = await Promise.all([
    prisma.reminder.findMany({
      where:   { userId: profileId, isCompleted: false, dueDate: { gte: new Date() } },
      orderBy: { dueDate: "asc" },
      take:    3,
      select:  { id: true, title: true, dueDate: true, reminderType: true },
    }).catch(() => []),
    prisma.gardenDiary.findMany({
      where:   { userId: profileId, status: "growing" },
      orderBy: { updatedAt: "desc" },
      take:    3,
      include: { plant: { select: { name: true } } },
    }).catch(() => []),
  ]);
  return { reminders, diaries };
}

// ── Hjälpfunktioner ───────────────────────────────────────────────

function priceKr(öre: number) {
  return Math.round(öre / 100).toLocaleString("sv-SE") + " kr";
}

// ── Sektionsrubrik ────────────────────────────────────────────────

function SectionLabel({ icon: Icon, text, color = "text-green-700" }: {
  icon: React.ElementType; text: string; color?: string;
}) {
  return (
    <div className={`flex items-center gap-2 mb-1 ${color}`}>
      <Icon className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-wider">{text}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SIDA
// ══════════════════════════════════════════════════════════════════

export default async function HomePage() {
  const currentMonth = new Date().getMonth() + 1;
  const monthName    = MONTHS_SV[currentMonth - 1];

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const [navUser, data] = await Promise.all([
    getNavUser(authUser?.id),
    getHomeData(currentMonth),
  ]);

  let profileId: string | null = null;
  let userHomeData: Awaited<ReturnType<typeof getUserHomeData>> | null = null;

  if (authUser) {
    const profile = await prisma.profile.findUnique({
      where:  { userId: authUser.id },
      select: { id: true },
    }).catch(() => null);
    profileId = profile?.id ?? null;
    if (profileId) {
      userHomeData = await getUserHomeData(profileId);
    }
  }

  const {
    plants, calendarTips, popularPosts, memberImages, guides,
    shopProducts, plantCount, userCount, guideCount, freeShippingThreshold,
    heroStatsVisible,
  } = data;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Topbar ──────────────────────────────────────────────── */}
      <TopBar freeShippingThreshold={freeShippingThreshold} />

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <Navbar user={navUser} />

      <main className="flex-1">

        {/* ════════════════════════════════════════════════════════
            1. HERO
        ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f7ef] via-[#fafaf8] to-[#f5f0e8]">
          {/* Dekor */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />
            <div className="absolute bottom-0 -left-16 h-64 w-64 rounded-full bg-amber-200/25 blur-2xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
            <div className="flex items-center gap-12 lg:gap-20">

              {/* ── Text-kolumn ── */}
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 border border-green-200 px-4 py-1.5 text-sm font-medium text-green-800 mb-6">
                  <Sprout className="h-4 w-4" />
                  Sveriges odlingscommunity
                </div>

                {/* Rubrik */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
                  Odla smartare –<br />
                  <span className="text-green-600">från frö till skörd</span>
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                  Planera din odling med AI-hjälp, identifiera växter, diagnos­tisera problem och hitta inspiration i vår community.
                </p>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  {navUser ? (
                    <Link
                      href="/min-odling"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors shadow-sm"
                    >
                      <Sprout className="h-4 w-4" /> Min odling
                    </Link>
                  ) : (
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors shadow-sm"
                    >
                      Kom igång – gratis <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    href="/vaxtidentifiering"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 text-gray-700 font-semibold text-sm transition-all"
                  >
                    <Camera className="h-4 w-4 text-green-600" /> Identifiera växt
                  </Link>
                </div>

                {/* Social proof */}
                {heroStatsVisible && (
                  <div className="flex items-center gap-6 mt-8">
                    {[
                      { value: plantCount,  label: "växter i databasen" },
                      { value: userCount,   label: "aktiva odlare" },
                      { value: guideCount,  label: "guider" },
                    ].map((s) => s.value > 0 ? (
                      <div key={s.label}>
                        <p className="text-xl font-bold text-gray-900">{s.value.toLocaleString("sv-SE")}+</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>

              {/* ── Illustration-kolumn ── */}
              <div className="hidden lg:flex shrink-0 w-[420px] items-center justify-center select-none">
                <svg viewBox="0 0 420 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm" aria-hidden="true">
                  <defs>
                    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="7" floodColor="#000" floodOpacity="0.09"/>
                    </filter>
                    <filter id="ps" x="-15%" y="-10%" width="130%" height="130%">
                      <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#c2410c" floodOpacity="0.22"/>
                    </filter>
                    <radialGradient id="bg" cx="50%" cy="48%" r="48%">
                      <stop offset="0%" stopColor="#f0fdf4"/>
                      <stop offset="100%" stopColor="#f0fdf4" stopOpacity="0"/>
                    </radialGradient>
                    <linearGradient id="pot" x1="0.2" y1="0" x2="0.8" y2="1">
                      <stop offset="0%" stopColor="#fdba74"/>
                      <stop offset="40%" stopColor="#f97316"/>
                      <stop offset="100%" stopColor="#c2410c"/>
                    </linearGradient>
                    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fed7aa"/>
                      <stop offset="100%" stopColor="#fb923c"/>
                    </linearGradient>
                    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#92400e"/>
                      <stop offset="100%" stopColor="#78350f"/>
                    </linearGradient>
                    <linearGradient id="ll" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#86efac"/>
                      <stop offset="100%" stopColor="#15803d"/>
                    </linearGradient>
                    <linearGradient id="ld" x1="0.2" y1="0" x2="0.8" y2="1">
                      <stop offset="0%" stopColor="#4ade80"/>
                      <stop offset="100%" stopColor="#166534"/>
                    </linearGradient>
                    <radialGradient id="tom" cx="32%" cy="28%" r="62%">
                      <stop offset="0%" stopColor="#fca5a5"/>
                      <stop offset="55%" stopColor="#ef4444"/>
                      <stop offset="100%" stopColor="#991b1b"/>
                    </radialGradient>
                    <radialGradient id="tom2" cx="32%" cy="28%" r="62%">
                      <stop offset="0%" stopColor="#fecaca"/>
                      <stop offset="55%" stopColor="#f87171"/>
                      <stop offset="100%" stopColor="#b91c1c"/>
                    </radialGradient>
                    <linearGradient id="stk" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a16207"/>
                      <stop offset="100%" stopColor="#d97706"/>
                    </linearGradient>
                    <linearGradient id="wcan" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7dd3fc"/>
                      <stop offset="100%" stopColor="#0284c7"/>
                    </linearGradient>
                  </defs>

                  {/* Bakgrundsglow */}
                  <circle cx="210" cy="230" r="200" fill="url(#bg)"/>

                  {/* ── Bambu-stöd ── */}
                  <rect x="217" y="168" width="7" height="222" rx="3.5" fill="url(#stk)" opacity="0.65"/>
                  <rect x="216" y="210" width="9" height="3" rx="1.5" fill="#92400e" opacity="0.45"/>
                  <rect x="216" y="255" width="9" height="3" rx="1.5" fill="#92400e" opacity="0.45"/>
                  <rect x="216" y="300" width="9" height="3" rx="1.5" fill="#92400e" opacity="0.45"/>

                  {/* ── Huvudstam ── */}
                  <path d="M221 385 C219 345 216 295 220 250 C224 205 218 182 221 168" stroke="#15803d" strokeWidth="7.5" strokeLinecap="round"/>

                  {/* ═══ GRENAR + BLAD ═══ */}

                  {/* Vänster gren (övre) */}
                  <path d="M221 205 C204 200 178 191 154 178" stroke="#16a34a" strokeWidth="5" strokeLinecap="round"/>
                  {/* Bladgrupp vänster övre */}
                  <path d="M154 178 C143 165 142 148 156 145 C170 142 176 161 167 172 C162 178 154 178 154 178Z" fill="url(#ll)"/>
                  <path d="M154 178 C148 165 153 153 160 149" stroke="#15803d" strokeWidth="0.8" opacity="0.4"/>
                  <path d="M170 183 C159 170 159 153 173 150 C187 147 192 166 183 177 C178 183 170 183 170Z" fill="url(#ld)"/>

                  {/* Höger gren (övre) */}
                  <path d="M221 228 C238 221 262 212 283 202" stroke="#16a34a" strokeWidth="4.5" strokeLinecap="round"/>
                  <path d="M283 202 C292 190 294 173 281 169 C268 165 261 183 270 194 C275 200 283 202 283Z" fill="url(#ld)"/>
                  <path d="M268 205 C277 193 278 176 265 172 C252 168 245 186 254 197 C259 203 268 205 268Z" fill="url(#ll)"/>

                  {/* Vänster gren (mitten) */}
                  <path d="M221 263 C205 256 184 247 166 240" stroke="#16a34a" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M166 240 C155 228 155 211 168 208 C181 205 187 223 178 234 C173 240 166 240 166Z" fill="url(#ll)"/>
                  <path d="M181 243 C170 231 170 214 183 211 C196 208 201 226 192 237 C187 243 181 243 181Z" fill="url(#ld)"/>

                  {/* Höger gren (mitten) */}
                  <path d="M221 282 C240 275 262 269 280 263" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round"/>
                  <path d="M280 263 C290 252 291 236 278 233 C265 230 258 247 268 258 C273 264 280 263 280Z" fill="url(#ld)"/>

                  {/* Vänster gren (nedre) */}
                  <path d="M221 320 C207 313 190 306 174 300" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round"/>
                  <path d="M174 300 C163 288 163 271 176 268 C189 265 195 283 185 294 C180 300 174 300 174Z" fill="url(#ll)"/>

                  {/* Höger gren (nedre) */}
                  <path d="M221 334 C238 327 256 322 272 316" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M272 316 C282 305 283 289 270 286 C257 283 250 300 260 311 C265 317 272 316 272Z" fill="url(#ld)"/>

                  {/* ═══ TOMATER ═══ */}

                  {/* Tomat-klase 1 — vänster övre (2 röda + 1 grön) */}
                  <path d="M165 172 C167 160 165 155 163 151" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M157 168 C155 156 153 152 151 148" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Stor röd */}
                  <circle cx="163" cy="144" r="14" fill="url(#tom)" filter="url(#sh)"/>
                  <path d="M156 138 C158 133 161 131 163 135 C165 131 168 133 170 138" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="157" cy="139" r="4" fill="white" opacity="0.18"/>
                  {/* Mellanstor röd */}
                  <circle cx="149" cy="155" r="11" fill="url(#tom2)" filter="url(#sh)"/>
                  <path d="M143 150 C145 147 147 145 149 148 C151 145 153 147 155 150" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="144" cy="150" r="2.8" fill="white" opacity="0.18"/>
                  {/* Liten grön (omogen) */}
                  <circle cx="175" cy="163" r="8.5" fill="#4ade80"/>
                  <path d="M171 159 C173 156 175 155 175 158 C177 155 179 156 179 159" stroke="#15803d" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

                  {/* Tomat-klase 2 — höger övre */}
                  <path d="M275 196 C277 184 275 179 273 174" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="273" cy="167" r="13" fill="url(#tom)" filter="url(#sh)"/>
                  <path d="M267 162 C269 157 271 156 273 159 C275 156 277 157 279 162" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="268" cy="162" r="3.2" fill="white" opacity="0.18"/>
                  {/* Liten bredvid */}
                  <circle cx="286" cy="182" r="9" fill="url(#tom2)"/>
                  <path d="M282 178 C284 175 286 174 286 177 C288 174 290 175 290 178" stroke="#15803d" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

                  {/* Tomat-klase 3 — vänster mitten */}
                  <path d="M178 235 C180 224 178 219 176 215" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="176" cy="208" r="12" fill="url(#tom2)" filter="url(#sh)"/>
                  <path d="M170 203 C172 199 174 198 176 201 C178 198 180 199 182 203" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="171" cy="203" r="3" fill="white" opacity="0.18"/>

                  {/* Tomat-klase 4 — höger mitten */}
                  <path d="M272 258 C274 248 272 244 270 240" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="270" cy="233" r="11" fill="url(#tom)" filter="url(#sh)"/>
                  <path d="M265 228 C267 225 269 224 270 227 C272 224 274 225 275 228" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="265" cy="228" r="2.8" fill="white" opacity="0.18"/>
                  {/* Omogen grön vid sidan */}
                  <circle cx="258" cy="272" r="7.5" fill="#86efac" opacity="0.9"/>

                  {/* Tomat-klase 5 — vänster nedre */}
                  <path d="M184 295 C182 286 180 282 178 278" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="178" cy="271" r="10" fill="url(#tom2)" filter="url(#sh)"/>
                  <path d="M173 267 C175 264 177 263 178 266 C180 263 182 264 183 267" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="174" cy="267" r="2.5" fill="white" opacity="0.18"/>

                  {/* ── Kruka ── */}
                  <ellipse cx="221" cy="412" rx="88" ry="12" fill="#000" opacity="0.07"/>
                  <path d="M155 370 L172 406 H270 L287 370 Z" fill="url(#pot)" filter="url(#ps)"/>
                  {/* Textur-linjer */}
                  <path d="M160 378 L170 400" stroke="#c2410c" strokeWidth="1" opacity="0.25" strokeLinecap="round"/>
                  <path d="M167 375 L178 400" stroke="#c2410c" strokeWidth="1" opacity="0.15" strokeLinecap="round"/>
                  {/* Kant */}
                  <rect x="142" y="356" width="158" height="20" rx="10" fill="url(#rim)"/>
                  <path d="M152 362 Q172 357 195 359" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.38"/>
                  {/* Jord */}
                  <ellipse cx="221" cy="358" rx="70" ry="10" fill="url(#soil)"/>
                  <ellipse cx="206" cy="357" rx="18" ry="5" fill="#78350f" opacity="0.35"/>
                  <ellipse cx="238" cy="359" rx="12" ry="3.5" fill="#92400e" opacity="0.25"/>

                  {/* ── Vattenkanna (höger nedre) ── */}
                  <ellipse cx="348" cy="396" rx="26" ry="5" fill="#000" opacity="0.06"/>
                  {/* Kanna-kropp */}
                  <rect x="322" y="355" width="52" height="38" rx="10" fill="url(#wcan)"/>
                  <rect x="322" y="355" width="52" height="38" rx="10" stroke="#0369a1" strokeWidth="1" opacity="0.4"/>
                  {/* Handtag */}
                  <path d="M374 362 C390 362 390 386 374 386" stroke="#0369a1" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  {/* Pip */}
                  <path d="M322 365 C310 360 300 355 292 348" stroke="#0284c7" strokeWidth="5" strokeLinecap="round"/>
                  <ellipse cx="291" cy="347" rx="5" ry="3" fill="#7dd3fc" transform="rotate(-20 291 347)"/>
                  {/* Glans */}
                  <path d="M328 360 Q338 357 348 359" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                  {/* Vattendroppar */}
                  <circle cx="280" cy="345" r="2.5" fill="#7dd3fc" opacity="0.8"/>
                  <circle cx="274" cy="352" r="2" fill="#7dd3fc" opacity="0.6"/>
                  <circle cx="270" cy="342" r="1.5" fill="#7dd3fc" opacity="0.5"/>

                  {/* ── Floating card: AI-identifiering ── */}
                  <rect x="274" y="96" width="136" height="72" rx="18" fill="white" filter="url(#sh)"/>
                  <rect x="274" y="96" width="136" height="72" rx="18" stroke="#f0fdf4" strokeWidth="1.5"/>
                  <circle cx="298" cy="119" r="15" fill="#dcfce7"/>
                  <text x="291" y="125" fontSize="14" fontFamily="system-ui">🌿</text>
                  <text x="320" y="115" fontSize="10.5" fontWeight="700" fill="#111827" fontFamily="system-ui, sans-serif">AI-identifiering</text>
                  <text x="320" y="129" fontSize="8.5" fill="#6b7280" fontFamily="system-ui, sans-serif">Foto → Växtnamn</text>
                  <rect x="282" y="145" width="68" height="15" rx="7.5" fill="#dcfce7"/>
                  <text x="289" y="156" fontSize="8" fontWeight="600" fill="#16a34a" fontFamily="system-ui, sans-serif">Plant.id · AI ✓</text>

                  {/* ── Floating card: Växtdiagnos ── */}
                  <rect x="6" y="176" width="128" height="68" rx="18" fill="white" filter="url(#sh)"/>
                  <rect x="6" y="176" width="128" height="68" rx="18" stroke="#fff7ed" strokeWidth="1.5"/>
                  <circle cx="30" cy="198" r="15" fill="#fff7ed"/>
                  <text x="23" y="204" fontSize="14" fontFamily="system-ui">🔍</text>
                  <text x="52" y="194" fontSize="10.5" fontWeight="700" fill="#111827" fontFamily="system-ui, sans-serif">Växtdiagnos</text>
                  <text x="52" y="208" fontSize="8.5" fill="#6b7280" fontFamily="system-ui, sans-serif">Symptom → Åtgärd</text>
                  <rect x="13" y="224" width="58" height="13" rx="6.5" fill="#fff7ed"/>
                  <text x="19" y="234" fontSize="8" fontWeight="600" fill="#ea580c" fontFamily="system-ui, sans-serif">Gratis · Snabbt</text>

                  {/* ── Badge: Identifierad med % ── */}
                  <rect x="18" y="308" width="124" height="42" rx="21" fill="white" filter="url(#sh)"/>
                  <circle cx="44" cy="329" r="13" fill="#dcfce7"/>
                  <text x="37" y="334" fontSize="13" fontFamily="system-ui">✓</text>
                  <text x="63" y="333" fontSize="10" fontWeight="600" fill="#15803d" fontFamily="system-ui, sans-serif">Tomat · 94%</text>

                  {/* ── Dekorativa prickar ── */}
                  <circle cx="374" cy="178" r="6.5" fill="#fde68a" opacity="0.75"/>
                  <circle cx="388" cy="204" r="4" fill="#bbf7d0" opacity="0.8"/>
                  <circle cx="360" cy="210" r="4.5" fill="#fca5a5" opacity="0.6"/>
                  <circle cx="30" cy="130" r="5" fill="#bbf7d0" opacity="0.7"/>
                  <circle cx="12" cy="155" r="3.5" fill="#fde68a" opacity="0.65"/>
                  <circle cx="50" cy="148" r="4" fill="#c7d2fe" opacity="0.65"/>
                  <circle cx="210" cy="46" r="5.5" fill="#bbf7d0" opacity="0.5"/>
                  <circle cx="232" cy="33" r="3.5" fill="#fde68a" opacity="0.55"/>
                  <circle cx="188" cy="38" r="4" fill="#fca5a5" opacity="0.45"/>
                  <circle cx="380" cy="280" r="3.5" fill="#c7d2fe" opacity="0.55"/>
                  <circle cx="20" cy="390" r="3" fill="#fde68a" opacity="0.4"/>

                  {/* ── Bi (dekorativ) ── */}
                  <ellipse cx="310" cy="260" rx="9" ry="5.5" fill="#fbbf24" opacity="0.9"/>
                  <line x1="307" y1="256" x2="307" y2="264" stroke="#92400e" strokeWidth="1.5" opacity="0.45"/>
                  <line x1="312" y1="256" x2="312" y2="264" stroke="#92400e" strokeWidth="1.5" opacity="0.45"/>
                  <ellipse cx="305" cy="254" rx="5.5" ry="3" fill="white" opacity="0.55" transform="rotate(-25 305 254)"/>
                  <ellipse cx="316" cy="254" rx="5.5" ry="3" fill="white" opacity="0.55" transform="rotate(25 316 254)"/>
                </svg>
              </div>

            </div>
          </div>

          {/* ── Hero Quick links ─────────────────────────────────── */}
          <div className="relative border-t border-gray-100 bg-white/70 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                {[
                  {
                    href: "/vaxtidentifiering",
                    emoji: "📸",
                    label: "Identifiera växt",
                    sub:   "Ladda upp ett foto",
                  },
                  {
                    href: "/vaxtdiagnos",
                    emoji: "🦠",
                    label: "Vad är fel?",
                    sub:   "Diagnos på sekunder",
                  },
                  {
                    href: "/min-odling",
                    emoji: "🌱",
                    label: "Min odling",
                    sub:   "Din personliga logg",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 px-4 py-4 sm:px-6 sm:py-5 hover:bg-green-50/70 transition-colors group text-center sm:text-left"
                  >
                    <span className="text-2xl sm:text-xl leading-none">{item.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400 hidden sm:block">{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            2. SNABBFUNKTIONER
        ════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <SectionLabel icon={Sprout} text="Verktyg" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Allt du behöver för din odling</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  href:  "/vaxtidentifiering",
                  icon:  Scan,
                  label: "Identifiera växt",
                  desc:  "Ladda upp ett foto och få artbestämning på sekunder",
                  bg:    "from-green-50 to-emerald-50",
                  iconBg:"bg-green-100",
                  iconC: "text-green-700",
                  badge: "AI",
                },
                {
                  href:  "/vaxtdiagnos",
                  icon:  Stethoscope,
                  label: "Växtdiagnos",
                  desc:  "Vad är fel på min växt? Välj symptom och få diagnos",
                  bg:    "from-amber-50 to-orange-50",
                  iconBg:"bg-amber-100",
                  iconC: "text-amber-700",
                  badge: "AI",
                },
                {
                  href:  "/odlingskalender",
                  icon:  Calendar,
                  label: "Odlingskalender",
                  desc:  "Vad kan du göra just nu? Säsongsanpassade tips",
                  bg:    "from-blue-50 to-sky-50",
                  iconBg:"bg-blue-100",
                  iconC: "text-blue-700",
                  badge: null,
                },
                {
                  href:  "/vaxtdatabas",
                  icon:  Leaf,
                  label: "Växtdatabas",
                  desc:  `${plantCount}+ växter med odlingstips, tider och skötsel`,
                  bg:    "from-sage-50 to-green-50",
                  iconBg:"bg-sage-100",
                  iconC: "text-sage-700",
                  badge: null,
                },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className={`relative flex flex-col gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${c.bg} border border-white/80 hover:shadow-md hover:-translate-y-0.5 transition-all group`}
                >
                  {c.badge && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">
                      {c.badge}
                    </span>
                  )}
                  <div className={`h-10 w-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                    <c.icon className={`h-5 w-5 ${c.iconC}`} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-1">
                      {c.label}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{c.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-700 mt-auto">
                    Öppna <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            3. MIN ODLING (personlig sektion)
        ════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 bg-[#f6f9f5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {navUser && userHomeData ? (
              /* INLOGGAD */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <SectionLabel icon={Sprout} text="Min odling" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Hej, {navUser.displayName ?? navUser.username}! 👋
                    </h2>
                  </div>
                  <Link
                    href="/min-odling"
                    className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-medium hover:text-green-800"
                  >
                    Se allt <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Påminnelser */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <BellRing className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-gray-800">Kommande påminnelser</p>
                    </div>
                    {userHomeData.reminders.length > 0 ? (
                      <ul className="space-y-3">
                        {userHomeData.reminders.map((r) => (
                          <li key={r.id} className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-sm text-gray-700 font-medium leading-tight">{r.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(r.dueDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">Inga kommande påminnelser</p>
                    )}
                    <Link
                      href="/paminnelser"
                      className="mt-4 inline-flex items-center gap-1 text-xs text-green-700 font-medium hover:underline"
                    >
                      Hantera påminnelser <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Dina växter */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-semibold text-gray-800">Dina växter</p>
                    </div>
                    {userHomeData.diaries.length > 0 ? (
                      <ul className="space-y-3">
                        {userHomeData.diaries.map((d) => (
                          <Link key={d.id} href={`/dagbok/${d.id}`} className="flex items-center gap-3 group">
                            <div className="h-8 w-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                              <Sprout className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-700 font-medium group-hover:text-green-700 transition-colors line-clamp-1">
                                {d.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {d.customPlantName ?? "Okänd växt"}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">Inga växter tillagda än</p>
                    )}
                    <Link
                      href="/dagbok/ny"
                      className="mt-4 inline-flex items-center gap-1 text-xs text-green-700 font-medium hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Lägg till växt
                    </Link>
                  </div>

                  {/* Snabbåtgärder */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm font-semibold text-gray-800 mb-4">Snabbåtgärder</p>
                    <div className="space-y-2">
                      {[
                        { href: "/dagbok/ny",          icon: Plus,       label: "Lägg till växt" },
                        { href: "/vaxtdiagnos",         icon: Stethoscope, label: "Diagnos på min växt" },
                        { href: "/vaxtidentifiering",   icon: Camera,     label: "Identifiera växt" },
                        { href: "/min-odling/vaxtproblem", icon: CheckCircle2, label: "Växtproblem-logg" },
                      ].map((a) => (
                        <Link
                          key={a.href}
                          href={a.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group"
                        >
                          <div className="h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                            <a.icon className="h-3.5 w-3.5 text-green-700" />
                          </div>
                          <span className="text-sm text-gray-700 group-hover:text-green-700 transition-colors font-medium">
                            {a.label}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-gray-300 ml-auto" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* EJ INLOGGAD */
              <div className="rounded-3xl bg-gradient-to-br from-green-600 to-green-700 px-6 py-12 sm:px-12 sm:py-16 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="relative max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-medium text-green-100 mb-5">
                    <Sprout className="h-3.5 w-3.5" /> Personlig odlingsplan
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                    Skapa konto och få din personliga odlingsplan
                  </h2>
                  <p className="text-green-100 mb-6 leading-relaxed">
                    Spara dina växter, sätt upp påminnelser, logga odlingsdagbok och få AI-hjälp med dina växtproblem. Alltid gratis.
                  </p>
                  <div className="flex items-center gap-4 mb-6">
                    {[
                      "Odlingsdagbok",
                      "Påminnelser",
                      "AI-diagnos",
                      "Växthistorik",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-sm text-green-100">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-300 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors"
                    >
                      Skapa gratis konto <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors"
                    >
                      Logga in
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            4. VÄXTDATABAS PREVIEW
        ════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <SectionLabel icon={Leaf} text="Växtdatabasen" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Populära växter</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Odlingstips, såningstider och skötselråd för {plantCount}+ växter
                </p>
              </div>
              <Link
                href="/vaxtdatabas"
                className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-semibold hover:text-green-800 transition-colors shrink-0"
              >
                Se alla växter <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {plants.length > 0 ? (
              <PlantsScroll plants={plants} />
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Leaf className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Inga växter i databasen än.</p>
              </div>
            )}

            <div className="mt-6 sm:hidden text-center">
              <Link href="/vaxtdatabas" className="text-sm text-green-700 font-semibold hover:underline">
                Se alla växter →
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            5. ODLINGSKALENDER
        ════════════════════════════════════════════════════════ */}
        {calendarTips.length > 0 && (
          <section className="py-14 sm:py-20 bg-[#f6f9f5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <SectionLabel icon={Calendar} text="Odlingskalender" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Vad gör du i {monthName}?
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Säsongsanpassade tips just nu</p>
                </div>
                <Link
                  href="/odlingskalender"
                  className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-semibold hover:text-green-800 shrink-0"
                >
                  Hela kalendern <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {calendarTips.map((tip) => {
                  const key  = tip.taskType?.toLowerCase() ?? "";
                  const col  = TASK_COLORS[key] ?? { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-400" };
                  return (
                    <Link
                      key={tip.id}
                      href={tip.slug ? `/odlingskalender/${tip.slug}` : "/odlingskalender"}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all group"
                    >
                      <div className={`h-8 w-8 rounded-xl ${col.bg} flex items-center justify-center shrink-0`}>
                        <div className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors line-clamp-1">
                          {tip.title}
                        </p>
                        {tip.category && (
                          <span className={`text-[11px] font-medium ${col.text} capitalize`}>{tip.category}</span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-green-500 shrink-0 mt-0.5" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 sm:hidden text-center">
                <Link href="/odlingskalender" className="text-sm text-green-700 font-semibold hover:underline">
                  Se hela kalendern →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════
            6. AI-SEKTION (prominent)
        ════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#1a3a2a] to-[#0f2419] overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Text */}
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-500/20 border border-green-500/30 px-3 py-1 text-xs font-semibold text-green-300 mb-5 w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    AI-driven växtanalys
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                    Få hjälp direkt med din växt
                  </h2>
                  <p className="text-green-100/80 leading-relaxed mb-8">
                    Ladda upp ett foto och låt vår AI identifiera växten eller hitta vad som är fel. Snabbt, enkelt och utan att du behöver vara expert.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      { icon: Camera,     text: "Identifiera okänd växt direkt från bild" },
                      { icon: Stethoscope, text: "Diagnos och behandlingsplan för sjuka växter" },
                      { icon: CheckCircle2, text: "Spara resultaten i din personliga logg" },
                    ].map((f) => (
                      <div key={f.text} className="flex items-start gap-3 text-sm text-green-100/90">
                        <f.icon className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                        {f.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/vaxtidentifiering"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors"
                    >
                      <Camera className="h-4 w-4" /> Identifiera växt
                    </Link>
                    <Link
                      href="/vaxtdiagnos"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium text-sm transition-colors"
                    >
                      <Stethoscope className="h-4 w-4" /> Växtdiagnos
                    </Link>
                  </div>
                </div>

                {/* Visuell panel */}
                <div className="relative p-8 sm:p-10 flex items-center justify-center bg-gradient-to-br from-green-800/20 to-transparent lg:border-l border-white/10">
                  <div className="space-y-3 w-full max-w-xs">
                    {[
                      {
                        emoji: "📸",
                        step: "Steg 1",
                        title: "Ladda upp foto",
                        desc: "Ta en bild på växten eller välj från galleriet",
                        done: true,
                      },
                      {
                        emoji: "🔍",
                        step: "Steg 2",
                        title: "AI analyserar",
                        desc: "Vår AI identifierar art, symptom och problem",
                        done: true,
                      },
                      {
                        emoji: "✅",
                        step: "Steg 3",
                        title: "Få svar direkt",
                        desc: "Artnamn, åtgärdsplan och produktrekommendationer",
                        done: false,
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 p-4 rounded-2xl border ${
                          s.done
                            ? "bg-white/10 border-white/15"
                            : "bg-green-500/15 border-green-500/30"
                        }`}
                      >
                        <span className="text-xl leading-none">{s.emoji}</span>
                        <div>
                          <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-0.5">
                            {s.step}
                          </p>
                          <p className="text-sm font-semibold text-white">{s.title}</p>
                          <p className="text-xs text-green-200/70 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            7. BUTIK PREVIEW
        ════════════════════════════════════════════════════════ */}
        {shopProducts.length > 0 && (
          <section className="py-14 sm:py-20 bg-[#f6f9f5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <SectionLabel icon={ShoppingBag} text="Butiken" color="text-amber-700" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Säsongens produkter</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Fri frakt på order över {priceKr(freeShippingThreshold ?? 49900)}
                  </p>
                </div>
                <Link
                  href="/butik"
                  className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-semibold hover:text-green-800 shrink-0"
                >
                  Gå till butik <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {shopProducts.map((p) => {
                  const pKr    = priceKr(p.price);
                  const wasKr  = p.compareAtPrice ? priceKr(p.compareAtPrice) : null;
                  const onSale = p.compareAtPrice && p.compareAtPrice > p.price;
                  return (
                    <Link
                      key={p.id}
                      href={`/butik/produkter/${p.slug}`}
                      className="group flex flex-col rounded-2xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-md transition-all overflow-hidden"
                    >
                      <div className="aspect-square bg-gray-50 overflow-hidden relative">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-gray-200" />
                          </div>
                        )}
                        {onSale && (
                          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                            REA
                          </span>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors line-clamp-2 leading-tight mb-1">
                          {p.name}
                        </p>
                        {p.shortDescription && (
                          <p className="text-xs text-gray-400 line-clamp-1 mb-2">{p.shortDescription}</p>
                        )}
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-sm font-bold text-gray-900">{pKr}</span>
                          {wasKr && (
                            <span className="text-xs text-gray-400 line-through">{wasKr}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/butik"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-800 font-semibold text-sm transition-all"
                >
                  <ShoppingBag className="h-4 w-4 text-green-600" />
                  Se hela butiken
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════
            8. COMMUNITY
        ════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">

              {/* Populära inlägg */}
              <div>
                <SectionLabel icon={TrendingUp} text="Community" />
                <div className="flex items-end justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">Heta diskussioner</h2>
                  <Link href="/forum" className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-medium hover:text-green-800">
                    Se forum <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {popularPosts.length > 0 ? (
                  <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                    {popularPosts.map((post, i) => (
                      <Link
                        key={post.id}
                        href={`/forum/${post.id}`}
                        className="flex items-start gap-4 p-4 hover:bg-green-50/50 transition-colors group bg-white"
                      >
                        <span className="text-lg font-bold text-gray-200 w-6 shrink-0 leading-tight mt-0.5 font-mono">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          {post.category && (
                            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 mb-1">
                              {post.category}
                            </span>
                          )}
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Avatar src={post.author.avatarUrl} fallback={post.author.username} size="xs" />
                              <span>@{post.author.username}</span>
                            </div>
                            <span className="flex items-center gap-0.5">
                              <Heart className="h-3 w-3" /> {post.likesCount}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="h-3 w-3" /> {post.commentsCount}
                            </span>
                            <span>{formatRelativeDate(post.createdAt)}</span>
                          </div>
                        </div>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt=""
                            className="h-12 w-12 rounded-xl object-cover shrink-0 hidden sm:block"
                            loading="lazy"
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                    <MessageSquare className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Inga inlägg ännu – bli den första!</p>
                    <Link href="/auth/register" className="mt-3 inline-block text-sm text-green-700 font-medium hover:underline">
                      Skapa konto
                    </Link>
                  </div>
                )}

                <div className="mt-4 sm:hidden">
                  <Link href="/forum" className="text-sm text-green-700 font-semibold hover:underline">
                    Se alla diskussioner →
                  </Link>
                </div>
              </div>

              {/* Bildflöde */}
              <div>
                <SectionLabel icon={Flower2} text="Från trädgårdarna" />
                <div className="flex items-end justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">Från trädgårdarna</h2>
                  <Link href="/forum" className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-medium hover:text-green-800">
                    Se forum <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                {memberImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {memberImages.map((post) => (
                      <Link key={post.id} href={`/forum/${post.id}`} className="group relative aspect-square">
                        <div className="w-full h-full rounded-2xl overflow-hidden bg-sage-100">
                          <img
                            src={post.imageUrl!}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <div className="flex items-center gap-1.5">
                            <Avatar src={post.author.avatarUrl} fallback={post.author.username} size="xs" />
                            <span className="text-white text-[10px] font-medium">@{post.author.username}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                    <Flower2 className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Inga bilder ännu – var den första!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            9. GUIDER
        ════════════════════════════════════════════════════════ */}
        {guides.length > 0 && (
          <section className="py-14 sm:py-20 bg-[#f6f9f5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <SectionLabel icon={BookOpen} text="Guider & kunskap" color="text-amber-700" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Lär dig odla</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Steg-för-steg-guider från erfarna odlare
                  </p>
                </div>
                <Link
                  href="/guider"
                  className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-semibold hover:text-green-800 shrink-0"
                >
                  Alla guider <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {guides.map((g) => (
                  <Link
                    key={g.id}
                    href={`/guider/${g.slug}`}
                    className="group flex flex-col rounded-2xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-amber-50 to-green-50 overflow-hidden">
                      {g.imageUrl ? (
                        <img
                          src={g.imageUrl}
                          alt={g.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-amber-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      {g.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1.5">
                          {g.category}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug mb-2">
                        {g.title}
                      </h3>
                      {g.excerpt && (
                        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{g.excerpt}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs font-semibold text-green-700 mt-3">
                        Läs guide <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 sm:hidden text-center">
                <Link href="/guider" className="text-sm text-green-700 font-semibold hover:underline">
                  Se alla guider →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════
            10. NYHETSBREV
        ════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 bg-green-700 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-green-500/20 blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-green-900/30 blur-2xl translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-medium text-green-100 mb-5">
                <Mail className="h-4 w-4" /> Gratis nyhetsbrev
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                Odlingstips direkt i din inkorg
              </h2>
              <p className="text-green-100 mb-8">
                Säsongsanpassade tips, nyheter från butiken och inspiration – varje vecka.
              </p>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 max-w-lg mx-auto">
                <NewsletterSignupForm source="homepage" />
                <p className="text-xs text-green-200 mt-3">Inga spam. Avprenumerera när du vill.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            11. SEO-TEXT
        ════════════════════════════════════════════════════════ */}
        <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Om Minodling – din odlingssajt</h2>
            <div className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed space-y-3">
              <p>
                <strong>Minodling</strong> är Sveriges ledande community och verktygsplattform för alla som älskar att odla. Oavsett om du odlar grönsaker på balkongen, sköter en stor trädgård eller bara har börjat med ditt första frö hjälper vi dig att lyckas med din odling.
              </p>
              <p>
                Med vår <strong>AI-drivna växtidentifiering</strong> kan du fotografera en okänd växt och få svar på sekunder. Vår <strong>växtdiagnos</strong> hjälper dig att hitta och åtgärda problem som gula blad, skadedjur eller rotröta – med konkreta steg-för-steg-anvisningar.
              </p>
              <p>
                <strong>Växtdatabasen</strong> innehåller hundratals växter med såningstider, odlingsguider, skötselråd och tips om vanliga problem. Från tomat och chili till gurka, sallat och örter – allt du behöver för att odla hemma.
              </p>
              <p>
                I vår <strong>community</strong> möts svenska odlare för att dela tips, ställa frågor och inspirera varandra. Du hittar också vår <strong>odlingskalender</strong> med säsongsanpassade uppgifter, påminnelser och en personlig odlingsdagbok.
              </p>
              <p>
                I <strong>butiken</strong> hittar du frön, jord, krukor och verktyg för alla typer av odling. Vi erbjuder fri frakt på beställningar över {priceKr(freeShippingThreshold ?? 49900)} och snabb leverans.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                { label: "Odla hemma",        href: "/guider" },
                { label: "Grönsaker",         href: "/vaxtdatabas?kategori=grönsaker" },
                { label: "Odlingsguide",      href: "/guider" },
                { label: "Frön",              href: "/butik" },
                { label: "Växter",            href: "/vaxtdatabas" },
                { label: "Balkongodling",     href: "/guider?q=balkong" },
                { label: "Odlingskalender",   href: "/odlingskalender" },
                { label: "Växtidentifiering", href: "/vaxtidentifiering" },
              ].map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-700 transition-colors"
                >
                  {t.label}
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
