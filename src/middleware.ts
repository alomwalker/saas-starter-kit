import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Protects /dashboard. Validates the Auth.js JWT session token
 * (signed with AUTH_SECRET, see src/auth.ts) — the cookie value
 * alone is never trusted. Unauthenticated visitors are sent to
 * /auth/login with ?next= so they land back on the page they asked
 * for after logging in.
 *
 * Cookie name depends on the scheme: Auth.js sets
 * "__Secure-authjs.session-token" over HTTPS and
 * "authjs.session-token" over plain HTTP, and getToken only finds
 * the token when the cookie name (which also salts the decryption
 * key) matches, so pick the name from the cookies actually present.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const secure = request.cookies.has("__Secure-authjs.session-token");
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: secure,
    cookieName: secure
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
