import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Change the signed-in user's password.
 *
 * POST { currentPassword, newPassword, confirmPassword }.
 * - 401 when not signed in.
 * - 400 when the account has no password set (Google-only or
 *   magic-link accounts) — those accounts use the password-reset
 *   flow on the login page to set their first password.
 * - 400 when the current password is wrong, the new password is
 *   under 8 characters, or the confirmation does not match.
 * The new password is stored as a bcrypt hash, never in plain text.
 */
export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "Current password, new password and confirmation are all required." },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "The new password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "The new password and its confirmation do not match." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!user.passwordHash) {
    return NextResponse.json(
      {
        error:
          "This account has no password set — it was created with Google sign-in or a magic link. Use “Forgot password?” on the login page to set one.",
      },
      { status: 400 },
    );
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  return NextResponse.json({ ok: true });
}
