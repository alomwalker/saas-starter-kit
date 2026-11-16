import crypto from "node:crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/db";

/**
 * Transactional email via Resend (https://resend.com).
 *
 * One API key does everything: RESEND_API_KEY (see .env.example).
 * It powers the magic-link provider in src/auth.ts, the password
 * reset flow, the signup verification email and the welcome email.
 *
 * If RESEND_API_KEY is not set, every function here returns a clear
 * "not configured" result instead of throwing — auth flows keep
 * working, and the email step reports the missing key instead of
 * crashing. Callers surface that message to the user.
 *
 * Resend's free tier covers 100 emails/day. Until the buyer verifies
 * their own sending domain in Resend, mail is sent from
 * onboarding@resend.dev and Resend only delivers to the Resend
 * account owner's own email address — see README § Email.
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "SaaS Starter <onboarding@resend.dev>";
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export type EmailResult = { ok: true } | { ok: false; error: string };

const NOT_CONFIGURED: EmailResult = {
  ok: false,
  error: "Email is not configured: set RESEND_API_KEY in .env (see README § Email).",
};

/** Send one transactional email. Never throws — returns an EmailResult. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) return NOT_CONFIGURED;
  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error("[email] Resend error:", error.message);
      return { ok: false, error: `Email failed to send: ${error.message}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error.";
    console.error("[email] send failed:", message);
    return { ok: false, error: `Email failed to send: ${message}` };
  }
}

// ---- Single-use tokens (password reset, email verification) ----
// Tokens are random 256-bit values. Only the SHA-256 hash is stored,
// in the Auth.js VerificationToken table — a database leak does not
// expose a usable token. A token is deleted when it is used, so a
// link works exactly once. Re-requesting a link invalidates the
// previous one for the same identifier.

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function createEmailToken(
  identifier: string,
  ttlHours: number,
): Promise<string> {
  const raw = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  // One live token per identifier: a new request invalidates the old link.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: hashToken(raw), expires },
  });
  return raw;
}

/** Verify a token and consume it (single use). Returns true only once. */
export async function verifyEmailToken(
  identifier: string,
  raw: string,
): Promise<boolean> {
  const rows = await prisma.verificationToken.findMany({ where: { identifier } });
  const want = hashToken(raw);
  for (const row of rows) {
    const given = Buffer.from(want);
    const stored = Buffer.from(row.token);
    if (given.length === stored.length && crypto.timingSafeEqual(given, stored)) {
      if (row.expires < new Date()) return false; // expired, not consumed
      await prisma.verificationToken.delete({ where: { token: row.token } });
      return true;
    }
  }
  return false;
}

// ---- The three emails this kit sends ----

export async function sendVerificationEmail(user: {
  name: string;
  email: string;
}): Promise<EmailResult> {
  const token = await createEmailToken(`verify-email:${user.email}`, 24);
  const url = `${getAppUrl()}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  return sendEmail({
    to: user.email,
    subject: "Verify your email — SaaS Starter",
    html: `<p>Hi ${user.name},</p>
<p>Thanks for signing up. Please confirm your email address by clicking the link below (valid for 24 hours):</p>
<p><a href="${url}">${url}</a></p>
<p>If you didn't create this account, you can ignore this email.</p>`,
  });
}

export async function sendPasswordResetEmail(user: {
  name: string;
  email: string;
}): Promise<EmailResult> {
  const token = await createEmailToken(`password-reset:${user.email}`, 1);
  const url = `${getAppUrl()}/auth/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  return sendEmail({
    to: user.email,
    subject: "Reset your password — SaaS Starter",
    html: `<p>Hi ${user.name},</p>
<p>Someone asked to reset the password for this account. Click the link below to choose a new one (valid for 1 hour):</p>
<p><a href="${url}">${url}</a></p>
<p>If that wasn't you, you can ignore this email — your password won't change.</p>`,
  });
}

export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
}): Promise<EmailResult> {
  return sendEmail({
    to: user.email,
    subject: "Welcome to SaaS Starter",
    html: `<p>Hi ${user.name},</p>
<p>Welcome — your account is ready. Open your dashboard at <a href="${getAppUrl()}/dashboard">${getAppUrl()}/dashboard</a> to get started.</p>
<p>Need help? Reply to this email.</p>`,
  });
}
