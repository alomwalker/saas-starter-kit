import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyEmailToken } from "@/lib/email";

/**
 * Set a new password with a reset link token.
 *
 * The token is single-use (verifyEmailToken consumes it) and
 * expires after 1 hour. A wrong, expired or already-used token
 * returns the same generic error as a missing account — the
 * response never says which of those it was.
 */
export async function POST(req: Request) {
  const { email, token, password } = (await req.json()) as {
    email?: string;
    token?: string;
    password?: string;
  };
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    !token ||
    !password ||
    password.length < 8
  ) {
    return NextResponse.json(
      { error: "A valid email, reset link and a password of at least 8 characters are required." },
      { status: 400 },
    );
  }

  const valid = await verifyEmailToken(`password-reset:${cleanEmail}`, token);
  if (!valid) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}
