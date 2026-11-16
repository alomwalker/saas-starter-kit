import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getPlanFromStripeMetadata } from "@/lib/stripe";

/**
 * Stripe webhook endpoint — implemented.
 *
 * Stripe signs every webhook with an HMAC-SHA256 signature in the
 * `stripe-signature` header: "t=<timestamp>,v1=<hex hmac>" over the
 * string "<timestamp>.<raw body>", keyed by the webhook endpoint
 * secret (STRIPE_WEBHOOK_SECRET). Requests older than 5 minutes
 * are rejected (replay protection — the same tolerance Stripe's
 * own SDK uses). Verified by hand with node:crypto, mirroring
 * the Polar webhook in /api/webhooks/polar/route.ts, so this route
 * needs no Stripe API key — only the endpoint secret.
 *
 * Events handled:
 *   checkout.session.completed -> activate / upgrade the buyer's
 *     plan (the plan comes from the Checkout Session metadata;
 *     see src/lib/stripe.ts — no pre-created Stripe products)
 *   charge.refunded            -> mark the subscription cancelled
 *     and downgrade the user to the free plan
 *   anything else              -> acknowledged and ignored
 *
 * The buyer is matched by email to a User row. If no account exists
 * for that email, the event is acknowledged (200) but nothing is
 * activated — an account must exist first; the event is logged so
 * the seller can follow up. No credentials are hard-coded; the
 * secret comes from STRIPE_WEBHOOK_SECRET (see .env.example).
 */
export const dynamic = "force-dynamic";

function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header) return false;
  let timestamp: string | null = null;
  const signatures: string[] = [];
  for (const entry of header.split(",")) {
    const [key, value] = entry.split("=");
    if (key === "t" && value) timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number.parseInt(timestamp, 10);
  if (Number.isNaN(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false; // 5-minute replay window

  const signed = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  return signatures.some((given) => {
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

type StripeSessionObject = {
  id?: string;
  customer?: string | { id?: string };
  customer_details?: { email?: string | null };
  customer_email?: string | null;
  metadata?: Record<string, string>;
  payment_status?: string;
};

type StripeChargeObject = {
  receipt_email?: string | null;
  billing_details?: { email?: string | null };
  payment_intent?: string | { id?: string };
};

function sessionEmail(session: StripeSessionObject): string | null {
  const email = session.customer_details?.email ?? session.customer_email;
  return email ? email.trim().toLowerCase() : null;
}

function chargeEmail(charge: StripeChargeObject): string | null {
  const email = charge.receipt_email ?? charge.billing_details?.email;
  return email ? email.trim().toLowerCase() : null;
}

function customerId(value: string | { id?: string } | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.id;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured: set STRIPE_WEBHOOK_SECRET (see README § Billing)." },
      { status: 400 },
    );
  }

  const rawBody = await req.text();
  if (!verifyStripeSignature(rawBody, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: { type?: string; data?: { object?: unknown } };
  try {
    event = JSON.parse(rawBody) as { type?: string; data?: { object?: unknown } };
  } catch {
    return NextResponse.json({ error: "Webhook body is not valid JSON." }, { status: 400 });
  }

  const type = event.type ?? "";
  const object = (event.data?.object ?? {}) as StripeSessionObject & StripeChargeObject;

  if (type === "checkout.session.completed") {
    const session = object as StripeSessionObject;
    const plan = getPlanFromStripeMetadata(session.metadata);
    if (!plan) {
      console.warn(`[stripe webhook] ${type}: session ${session.id ?? "(none)"} has no plan in metadata.`);
      return NextResponse.json({ ok: true, ignored: type, note: "No plan in session metadata." });
    }
    if (session.payment_status && session.payment_status !== "paid") {
      return NextResponse.json({ ok: true, ignored: type, note: `payment_status is ${session.payment_status}.` });
    }
    const email = sessionEmail(session);
    if (!email) {
      return NextResponse.json({ ok: true, ignored: type, note: "No customer email in session." });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`[stripe webhook] ${type} for ${email}: no matching user account — plan not activated.`);
      return NextResponse.json({ ok: true, ignored: type, note: "No matching user account." });
    }
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan,
        status: "active",
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: customerId(session.customer),
      },
      create: {
        userId: user.id,
        plan,
        status: "active",
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: customerId(session.customer),
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { plan } });
    return NextResponse.json({ ok: true, type, email, plan });
  }

  if (type === "charge.refunded") {
    const charge = object as StripeChargeObject;
    const email = chargeEmail(charge);
    if (!email) {
      return NextResponse.json({ ok: true, ignored: type, note: "No customer email on charge." });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`[stripe webhook] ${type} for ${email}: no matching user account.`);
      return NextResponse.json({ ok: true, ignored: type, note: "No matching user account." });
    }
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { status: "canceled" },
      create: { userId: user.id, plan: user.plan, status: "canceled" },
    });
    await prisma.user.update({ where: { id: user.id }, data: { plan: "free" } });
    return NextResponse.json({ ok: true, type, email, plan: "free" });
  }

  return NextResponse.json({ ok: true, ignored: type });
}
