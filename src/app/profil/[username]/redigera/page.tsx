export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { updateProfile } from "@/app/profil/actions";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Redigera profil" };

const GROWING_TYPES = [
  { value: "balcony",    label: "🪴 Balkong" },
  { value: "greenhouse", label: "🏡 Växthus" },
  { value: "garden",     label: "🌳 Trädgård" },
  { value: "indoor",     label: "🪟 Inomhus" },
  { value: "allotment",  label: "🌱 Kolonilott" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner",  label: "🌱 Nybörjare" },
  { value: "hobbyist",  label: "🌿 Hobbyodlare" },
  { value: "experienced", label: "🌳 Erfaren" },
];

const GROWING_ZONES = ["1", "2", "3", "4", "5", "6", "7", "8"];

function Field({ label, name, children, hint }: { label: string; name?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputClass = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export default async function RedigeraProfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ sparad?: string }>;
}) {
  const { username } = await params;
  const { sparad } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirect=/profil/${username}/redigera`);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      username: true, fullName: true, avatarUrl: true, bio: true,
      location: true, growingZone: true, growingType: true, experienceLevel: true, role: true,
    },
  });

  if (!profile || profile.username !== username) redirect("/dashboard");

  const navUser = { id: user.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50 py-8">
        <div className="container-main max-w-xl">
          <div className="mb-6">
            <Link href={`/profil/${username}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" /> Tillbaka till profilen
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Redigera profil</h1>
          </div>

          {/* Sparat-bekräftelse */}
          {sparad === "1" && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <span className="font-medium">Profilen har sparats!</span>
            </div>
          )}

          {/* Avatar */}
          <Card className="mb-6 flex flex-col items-center py-6">
            <AvatarUpload currentUrl={profile.avatarUrl} username={profile.username} />
          </Card>

          {/* Formulär */}
          <Card>
            <form action={updateProfile} className="space-y-5">
              <Field label="Visningsnamn" name="fullName">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  defaultValue={profile.fullName ?? ""}
                  placeholder={profile.username}
                  maxLength={60}
                  className={inputClass}
                />
              </Field>

              <Field label="Bio" name="bio" hint="Max 280 tecken">
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile.bio ?? ""}
                  placeholder="Berätta lite om dig och din odling..."
                  maxLength={280}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <Field label="Plats" name="location">
                <input
                  id="location"
                  name="location"
                  type="text"
                  defaultValue={profile.location ?? ""}
                  placeholder="T.ex. Stockholm, Göteborg..."
                  maxLength={80}
                  className={inputClass}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Odlingszon" name="growingZone" hint="Klimatzon 1–8">
                  <select
                    id="growingZone"
                    name="growingZone"
                    defaultValue={profile.growingZone ?? ""}
                    className={inputClass}
                  >
                    <option value="">Välj zon</option>
                    {GROWING_ZONES.map((z) => (
                      <option key={z} value={z}>Zon {z}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Odlingstyp" name="growingType">
                  <select
                    id="growingType"
                    name="growingType"
                    defaultValue={profile.growingType ?? ""}
                    className={inputClass}
                  >
                    <option value="">Välj typ</option>
                    {GROWING_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Erfarenhetsnivå" name="experienceLevel">
                <div className="grid grid-cols-3 gap-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <label
                      key={lvl.value}
                      className="relative flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="experienceLevel"
                        value={lvl.value}
                        defaultChecked={profile.experienceLevel === lvl.value}
                        className="sr-only peer"
                      />
                      <div className="w-full text-center py-3 px-2 rounded-xl border border-gray-200 text-sm peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 peer-checked:font-medium hover:border-gray-300 transition-colors">
                        {lvl.label}
                      </div>
                    </label>
                  ))}
                </div>
              </Field>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors"
                >
                  Spara profil
                </button>
              </div>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
