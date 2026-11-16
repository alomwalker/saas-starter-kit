import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const PLANS = ["free", "starter", "pro"] as const;
type Plan = (typeof PLANS)[number];

/**
 * Customer management (signed-in users only — the dashboard is
 * single-workspace, so every customer row belongs to the owner).
 *
 * POST { name, email, plan } — creates a Customer row.
 *   201 { ok, customer } / 400 invalid input / 409 email exists.
 * DELETE ?id=... — deletes one Customer row.
 *   200 { ok: true } / 400 missing id / 404 not found.
 */
export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { name?: string; email?: string; plan?: string };
  try {
    body = (await req.json()) as { name?: string; email?: string; plan?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const plan = (body.plan ?? "free") as Plan;
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Name and a valid email are required." },
      { status: 400 },
    );
  }
  if (!PLANS.includes(plan)) {
    return NextResponse.json(
      { error: "Plan must be free, starter or pro." },
      { status: 400 },
    );
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A customer with this email already exists." },
      { status: 409 },
    );
  }

  const customer = await prisma.customer.create({
    data: { name, email, plan },
  });
  return NextResponse.json({ ok: true, customer }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "Customer id is required." }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
