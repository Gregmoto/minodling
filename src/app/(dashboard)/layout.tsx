import { redirect } from "next/navigation";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const profile = await getUserProfile();

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
