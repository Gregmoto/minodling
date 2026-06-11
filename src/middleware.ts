import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Kräver inloggning
// OBS: /profil är INTE med – /profil/[username] är publika sidor.
// Skydd för /profil/[username]/redigera sker i page.tsx-filen direkt.
const protectedRoutes = ["/dashboard", "/min-odling", "/installningar", "/dagbok", "/paminnelser"];
// Kräver inloggning – rollkoll sker i layout
const adminRoutes     = ["/admin"];
const moderatorRoutes = ["/moderator"];
// Skicka inloggade vidare från auth-sidor
const authRoutes      = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  const isProtected  = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isModRoute   = moderatorRoutes.some((r) => pathname.startsWith(r));
  const isAuth       = authRoutes.some((r) => pathname.startsWith(r));

  // Om sidan inte kräver auth-koll — passera direkt
  if (!isProtected && !isAdminRoute && !isModRoute && !isAuth) {
    return supabaseResponse;
  }

  let user = null;

  try {
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

    // getSession() läser JWT:n från cookien utan nätverksanrop till Supabase
    // (getUser() kostar en roundtrip per request). Middleware behöver bara
    // veta OM en session finns för redirect-logiken – riktig validering av
    // token + roll sker i layouts/pages via getCurrentUser()/requireAdmin().
    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;
  } catch {
    // Om Supabase-anropet misslyckas — behandla som utloggad
    user = null;
  }

  // Ej inloggad → skicka till login (men undvik loop om vi redan är på /auth/login)
  if ((isProtected || isAdminRoute || isModRoute) && !user) {
    if (pathname.startsWith("/auth/")) return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redan inloggad → skicka från auth-sidor (men bara till /dashboard, inte tillbaka)
  if (isAuth && user) {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    const destination = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("/auth")
      ? redirectTo
      : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
