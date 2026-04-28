import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, userId: true, username: true, fullName: true, avatarUrl: true, role: true },
  });

  const navUser = profile ? {
    id: profile.id,
    username: profile.username,
    displayName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
  } : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
