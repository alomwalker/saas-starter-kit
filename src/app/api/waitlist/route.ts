import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIp, rateLimitExceeded } from "@/lib/rate-limit";

/**
 * Launch waitlist: POST { email, name? }.
 * Stores the signup in the WaitlistSignup table. The kit never
 * emails these addresses itself — the seller exports them from
 * the dashboard and mails them from their own tool at launch.
 *
 * 200 { ok: true } on success, 409 if the email is already on
 * the list, 400 for a missing/invalid email. Error messages are
 * deliberately generic — no internals leak.
 */
export async function POST(req: Request) {
  const limit = checkRateLimit(getClientIp(req), "waitlist");
  if (!limit.allowed) return rateLimitExceeded(limit.retryAfterSeconds);

  let body: { email?: string; name?: string };
  try {
    body = (await req.json()) as { email?: string; name?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim() || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 },
    );
  }

  const existing = await prisma.waitlistSignup.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "This email is already on the waitlist." },
      { status: 409 },
    );
  }

  await prisma.waitlistSignup.create({ data: { email, name } });
  return NextResponse.json({ ok: true });
}
