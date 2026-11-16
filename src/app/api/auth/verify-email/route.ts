import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyEmailToken } from "@/lib/email";

/**
 * Verify the email address from the link sent at signup.
 *
 * GET /api/auth/verify-email?token=...&email=...
 * The token is single-use and expires after 24 hours. On success
 * the user's emailVerified is set and the browser is sent to the
 * login page with ?verify=ok; on any failure it goes to the login
 * page with ?verify=invalid (no detail is leaked in the URL).
 * Login is NOT blocked while the email is unverified — this route
 * only records the verification (see README § Auth).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  const loginBase = new URL("/auth/login", url.origin);

  if (!token || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    loginBase.searchParams.set("verify", "invalid");
    return NextResponse.redirect(loginBase);
  }

  const valid = await verifyEmailToken(`verify-email:${email}`, token);
  if (!valid) {
    loginBase.searchParams.set("verify", "invalid");
    return NextResponse.redirect(loginBase);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    loginBase.searchParams.set("verify", "invalid");
    return NextResponse.redirect(loginBase);
  }

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
  loginBase.searchParams.set("verify", "ok");
  return NextResponse.redirect(loginBase);
}
