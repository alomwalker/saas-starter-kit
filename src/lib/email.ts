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
 * Every email is branded: an indigo header with the diamond mark
 * (a text glyph, not an external image — email clients block
 * remote images by default) and a plain-text fallback, so the
 * message reads correctly even where HTML is stripped.
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

// ---- Branded template ----
// Table layout + inline styles: the only layout that renders
// consistently across email clients. No external images, no web
// fonts — the diamond is the ◆ text glyph in the header.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Plain-text fallback must not carry HTML: user names can contain
// "<...>" sequences, which read as broken tags in a text client.
function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

export type BuiltEmail = { subject: string; html: string; text: string };

function buildTemplate(opts: {
  subject: string;
  heading: string;
  intro: string;
  buttonText?: string;
  buttonUrl?: string;
  afterButton?: string;
  footer: string;
}): BuiltEmail {
  const { subject, heading, intro, buttonText, buttonUrl, afterButton, footer } = opts;
  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#4338ca;padding:24px 32px;color:#ffffff;font-size:22px;font-weight:bold;">&#9670; SaaS Starter</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">${escapeHtml(heading)}</h1>
<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">${escapeHtml(intro)}</p>
${
  buttonText && buttonUrl
    ? `<p style="margin:24px 0;"><a href="${buttonUrl}" style="display:inline-block;background:#4338ca;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">${escapeHtml(buttonText)}</a></p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">Or paste this link into your browser:<br><a href="${buttonUrl}" style="color:#4338ca;">${buttonUrl}</a></p>`
    : ""
}
${afterButton ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">${escapeHtml(afterButton)}</p>` : ""}
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;line-height:1.5;">${escapeHtml(footer)}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const textLines = [
    `SaaS Starter — ${stripTags(heading)}`,
    "",
    stripTags(intro),
    "",
    ...(buttonText && buttonUrl
      ? [`${stripTags(buttonText)}: ${buttonUrl}`, ""]
      : []),
    ...(afterButton ? [stripTags(afterButton), ""] : []),
    stripTags(footer),
  ];
  return { subject, html, text: textLines.join("\n") };
}

// ---- Pure builders (no sending) — unit-tested, see below ----

export function buildVerificationEmail(user: { name: string; email: string }, url: string): BuiltEmail {
  return buildTemplate({
    subject: "Verify your email — SaaS Starter",
    heading: "Confirm your email address",
    intro: `Hi ${user.name}, thanks for signing up. Please confirm your email address by clicking the button below (valid for 24 hours).`,
    buttonText: "Verify my email",
    buttonUrl: url,
    footer: "If you didn't create this account, you can ignore this email.",
  });
}

export function buildPasswordResetEmail(user: { name: string; email: string }, url: string): BuiltEmail {
  return buildTemplate({
    subject: "Reset your password — SaaS Starter",
    heading: "Reset your password",
    intro: `Hi ${user.name}, someone asked to reset the password for this account. Click the button below to choose a new one (valid for 1 hour).`,
    buttonText: "Choose a new password",
    buttonUrl: url,
    footer: "If that wasn't you, you can ignore this email — your password won't change.",
  });
}

export function buildWelcomeEmail(user: { name: string; email: string }): BuiltEmail {
  return buildTemplate({
    subject: "Welcome to SaaS Starter",
    heading: `Welcome, ${user.name}`,
    intro: "Your account is ready. Open your dashboard to get started.",
    buttonText: "Open your dashboard",
    buttonUrl: `${getAppUrl()}/dashboard`,
    afterButton: "Need help? Just reply to this email.",
    footer: "You received this email because you signed up for SaaS Starter.",
  });
}

export function buildMagicLinkEmail(email: string, url: string): BuiltEmail {
  return buildTemplate({
    subject: "Sign in to SaaS Starter",
    heading: "Your sign-in link",
    intro: `Click the button below to sign in as ${email}. The link works once and expires in 24 hours.`,
    buttonText: "Sign in",
    buttonUrl: url,
    footer: "If you didn't ask to sign in, you can ignore this email.",
  });
}

// ---- Sending ----

/** Send one transactional email. Never throws — returns an EmailResult. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) return NOT_CONFIGURED;
  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.text ? { text: opts.text } : {}),
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

// ---- The four emails this kit sends ----

export async function sendVerificationEmail(user: {
  name: string;
  email: string;
}): Promise<EmailResult> {
  const token = await createEmailToken(`verify-email:${user.email}`, 24);
  const url = `${getAppUrl()}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  const built = buildVerificationEmail(user, url);
  return sendEmail({ to: user.email, ...built });
}

export async function sendPasswordResetEmail(user: {
  name: string;
  email: string;
}): Promise<EmailResult> {
  const token = await createEmailToken(`password-reset:${user.email}`, 1);
  const url = `${getAppUrl()}/auth/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  const built = buildPasswordResetEmail(user, url);
  return sendEmail({ to: user.email, ...built });
}

export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
}): Promise<EmailResult> {
  const built = buildWelcomeEmail(user);
  return sendEmail({ to: user.email, ...built });
}

/**
 * Magic-link email, used by Auth.js's Resend provider via a custom
 * sendVerificationRequest in src/auth.ts. Throws on failure so
 * Auth.js surfaces the error instead of pretending the link went out.
 */
export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
  const built = buildMagicLinkEmail(email, url);
  const result = await sendEmail({ to: email, ...built });
  if (!result.ok) throw new Error(result.error);
}
