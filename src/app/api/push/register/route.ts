import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Registrerar en enhets APNs-token så att påminnelser kan skickas som
 * push-notiser. Anropas av iOS-appen efter att användaren godkänt notiser.
 *
 * Kräver inloggning – tokens knyts alltid till en profil, aldrig anonymt.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
  }

  let body: { token?: unknown; platform?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const platform = body.platform === "android" ? "android" : "ios";

  // APNs-tokens är hex; var strikt så att skräp inte fyller tabellen.
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(token)) {
    return NextResponse.json({ error: "Ogiltig token" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profil saknas" }, { status: 404 });
  }

  // Samma token kan byta ägare om en enhet delas – upsert hanterar båda fallen.
  await prisma.deviceToken.upsert({
    where: { token },
    update: { userId: profile.id, platform, isActive: true, lastSeenAt: new Date() },
    create: { userId: profile.id, token, platform },
  });

  return NextResponse.json({ ok: true });
}

/** Avregistrerar enheten, t.ex. vid utloggning. */
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
  }

  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) return NextResponse.json({ error: "Token saknas" }, { status: 400 });

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ ok: true });

  // deleteMany + userId så att ingen kan avregistrera någon annans enhet.
  await prisma.deviceToken.deleteMany({ where: { token, userId: profile.id } });
  return NextResponse.json({ ok: true });
}
