import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
import { checkRateLimit, getClientIp, rateLimitExceeded } from "@/lib/rate-limit";

/**
 * Real signup: creates a User row with a bcrypt-hashed password.
 * The password is never stored in plain text and never returned.
 * After signup the client signs the user in via Auth.js
 * (signIn("credentials")) — this route does not issue a session.
 *
 * If email is configured (RESEND_API_KEY), a verification link and
 * a welcome email are sent. If it is not configured, signup still
 * succeeds — the response reports emailSent: false so the client
 * can say so plainly instead of pretending a mail went out.
 * Login is NOT blocked while the email is unverified (README § Auth).
 */
export async function POST(req: Request) {
  const limit = checkRateLimit(getClientIp(req));
  if (!limit.allowed) return rateLimitExceeded(limit.retryAfterSeconds);

  const { name, email, password } = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const cleanName = (name ?? "").trim();
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!cleanName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json(
      { error: "Name and a valid email are required." },
      { status: 400 },
    );
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Log in instead." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name: cleanName, email: cleanEmail, passwordHash, plan: "free" },
  });

  const verification = await sendVerificationEmail({ name: cleanName, email: cleanEmail });
  if (!verification.ok) {
    console.error("[signup] verification email not sent:", verification.error);
  } else {
    const welcome = await sendWelcomeEmail({ name: cleanName, email: cleanEmail });
    if (!welcome.ok) console.error("[signup] welcome email not sent:", welcome.error);
  }
  return NextResponse.json({ ok: true, emailSent: verification.ok });
}
