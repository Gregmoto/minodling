import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true },
  });

  return profile?.role === "ADMIN" ? user : null;
}

const updateUserSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
  isBanned: z.boolean().optional(),
  bannedReason: z.string().optional(),
  membershipTier: z.enum(["FREE", "PREMIUM"]).optional(),
});

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Åtkomst nekad" }, { status: 403 });

  const body = await request.json();
  const result = updateUserSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });

  const { userId, ...data } = result.data;

  const profile = await prisma.profile.update({
    where: { id: userId },
    data: {
      ...data,
      ...(data.isBanned ? { bannedAt: new Date() } : { bannedAt: null }),
    },
  });

  return NextResponse.json({ profile });
}
