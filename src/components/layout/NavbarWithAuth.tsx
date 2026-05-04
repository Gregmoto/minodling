import { getRequestUser } from "@/lib/auth-cache";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "./Navbar";

/**
 * Async server component – wraps Navbar with Supabase auth.
 * Meant to be used inside a <Suspense> boundary so it doesn't
 * block the surrounding page render.
 */
export async function NavbarWithAuth() {
  const user = await getRequestUser();
  const navUser = await getNavUser(user?.id);
  return <Navbar user={navUser} />;
}
