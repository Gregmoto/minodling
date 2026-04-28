import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Kräver inloggning
const protectedRoutes = ["/dashboard", "/min-odling", "/profil", "/installningar", "/dagbok", "/paminnelser"];
// Kräver inloggning – rollkoll sker i layout
const adminRoutes     = ["/admin"];
const moderatorRoutes = ["/moderator"];
// Skicka inloggade vidare från auth-sidor
const authRoutes      = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isProtected  = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isModRoute   = moderatorRoutes.some((r) => pathname.startsWith(r));
  const isAuth       = authRoutes.some((r) => pathname.startsWith(r));

  // Ej inloggad → skicka till login
  if ((isProtected || isAdminRoute || isModRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redan inloggad → skicka från auth-sidor
  if (isAuth && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
