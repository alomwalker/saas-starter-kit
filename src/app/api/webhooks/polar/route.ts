import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getPlanForProductId } from "@/lib/polar";

/**
 * Polar webhook endpoint — implemented.
 *
 * Polar signs every webhook with Svix (Standard Webhooks):
 *   webhook-id, webhook-timestamp, webhook-signature: "v1,<base64 hmac>"
 * over the string "<id>.<timestamp>.<raw body>", HMAC-SHA256 with the
 * webhook secret (base64-decoded when it starts with "whsec_").
 * Requests older than 5 minutes are rejected (replay protection).
 *
 * Events handled:
 *   order.created, subscription.created, subscription.active,
 *   subscription.updated  -> activate / upgrade the buyer's plan
 *   subscription.canceled, subscription.revoked
 *                            -> mark the subscription cancelled/revoked
 *                               and downgrade the user to the free plan
 *   anything else          -> acknowledged and ignored
 *
 * The buyer is matched by email to a User row. If no account exists
 * for that email, the event is acknowledged (200) but nothing is
 * activated — an account must exist first; the event is logged so
 * the seller can follow up. No credentials are hard-coded; the
 * secret comes from POLAR_WEBHOOK_SECRET (see .env.example).
 */
export const dynamic = "force-dynamic";

function verifySvixSignature(
  rawBody: string,
  headers: Headers,
  secret: string,
): boolean {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signature = headers.get("webhook-signature");
  if (!id || !timestamp || !signature) return false;

  const ts = Number.parseInt(timestamp, 10);
  if (Number.isNaN(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false; // 5-minute replay window

  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice("whsec_".length), "base64")
    : Buffer.from(secret, "utf-8");
  const signed = `${id}.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", key).update(signed).digest("base64");

  return signature.split(" ").some((entry) => {
    const parts = entry.split(",");
    if (parts[0] !== "v1" || !parts[1]) return false;
    const given = Buffer.from(parts[1]);
    const want = Buffer.from(expected);
    if (given.length !== want.length) return false;
    return crypto.timingSafeEqual(given, want);
  });
}

type PolarEventData = {
  id?: string;
  product_id?: string;
  status?: string;
  current_period_end?: string;
  customer_id?: string;
  customer_email?: string;
  email?: string;
  customer?: { id?: string; email?: string };
};

function eventEmail(data: PolarEventData): string | null {
  const email = data.customer?.email ?? data.customer_email ?? data.email;
  return email ? email.trim().toLowerCase() : null;
}

export async function POST(req: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Polar webhook is not configured: set POLAR_WEBHOOK_SECRET (see README § Billing)." },
      { status: 400 },
    );
  }

  const rawBody = await req.text();
  if (!verifySvixSignature(rawBody, req.headers, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: { type?: string; data?: PolarEventData };
  try {
    event = JSON.parse(rawBody) as { type?: string; data?: PolarEventData };
  } catch {
    return NextResponse.json({ error: "Webhook body is not valid JSON." }, { status: 400 });
  }

  const type = event.type ?? "";
  const data = event.data ?? {};

  const activating = new Set([
    "order.created",
    "subscription.created",
    "subscription.active",
    "subscription.updated",
  ]);
  const cancelling = new Set(["subscription.canceled", "subscription.revoked"]);

  if (!activating.has(type) && !cancelling.has(type)) {
    return NextResponse.json({ ok: true, ignored: type });
  }

  const email = eventEmail(data);
  if (!email) {
    return NextResponse.json({ ok: true, ignored: type, note: "No customer email in event." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.warn(`[polar webhook] ${type} for ${email}: no matching user account — plan not activated.`);
    return NextResponse.json({ ok: true, ignored: type, note: "No matching user account." });
  }

  if (cancelling.has(type)) {
    const status = type === "subscription.canceled" ? "canceled" : "revoked";
    if (data.id) {
      await prisma.subscription.upsert({
        where: { polarSubscriptionId: data.id },
        update: { status },
        create: {
          userId: user.id,
          plan: user.plan,
          status,
          polarSubscriptionId: data.id,
          polarCustomerId: data.customer_id ?? data.customer?.id,
        },
      });
    }
    await prisma.user.update({ where: { id: user.id }, data: { plan: "free" } });
    return NextResponse.json({ ok: true, type, email, plan: "free" });
  }

  // Activating event: map the Polar product to a plan.
  const plan = getPlanForProductId(data.product_id);
  if (!plan) {
    console.warn(`[polar webhook] ${type} for ${email}: unknown product_id ${data.product_id ?? "(none)"}.`);
    return NextResponse.json({ ok: true, ignored: type, note: "Unknown Polar product_id." });
  }

  const polarStatus = (data.status ?? "active").toLowerCase();
  const status =
    polarStatus === "active" || polarStatus === "trialing"
      ? polarStatus
      : polarStatus === "past_due"
        ? "past_due"
        : "active";
  const periodEnd = data.current_period_end ? new Date(data.current_period_end) : undefined;

  if (data.id && type.startsWith("subscription.")) {
    await prisma.subscription.upsert({
      where: { polarSubscriptionId: data.id },
      update: {
        userId: user.id,
        plan,
        status,
        polarCustomerId: data.customer_id ?? data.customer?.id,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId: user.id,
        plan,
        status,
        polarSubscriptionId: data.id,
        polarCustomerId: data.customer_id ?? data.customer?.id,
        currentPeriodEnd: periodEnd,
      },
    });
  } else {
    // order.created has no subscription id yet — record the plan on
    // the user; the subscription.created event fills in the details.
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { plan, status },
      create: { userId: user.id, plan, status },
    });
  }
  await prisma.user.update({ where: { id: user.id }, data: { plan } });
  return NextResponse.json({ ok: true, type, email, plan });
}
