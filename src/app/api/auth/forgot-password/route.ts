import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";

/**
 * Request a password reset link.
 *
 * Always returns 200 with the same shape — it never reveals
 * whether an account exists for the email. Only accounts with a
 * password (credentials accounts) get a link: a Google-only
 * account has no password to reset. If email is not configured,
 * the response says so plainly (emailConfigured: false) instead
 * of pretending a link was sent.
 */
export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }

  const configured = isEmailConfigured();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (configured && user && user.passwordHash) {
    const result = await sendPasswordResetEmail(user);
    if (!result.ok) console.error("[forgot-password]", result.error);
  }
  return NextResponse.json({ ok: true, emailConfigured: configured });
}
