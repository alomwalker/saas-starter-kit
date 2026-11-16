import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const PLANS = ["free", "starter", "pro"] as const;
type Plan = (typeof PLANS)[number];

type ImportRow = { name?: unknown; email?: unknown; plan?: unknown };

/**
 * POST /api/customers/import — bulk-creates customers from parsed CSV
 * rows (signed-in users only). The dashboard's Import CSV form reads
 * the file client-side and sends { rows: [{ name, email, plan }] }.
 *
 * Each row is validated: name required, email must be valid, plan must
 * be free/starter/pro. Rows with an email that already exists are
 * skipped, never overwritten. Returns 200:
 * { ok, created, skipped: [{ row, reason }] }.
 */
export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { rows?: ImportRow[] };
  try {
    body = (await req.json()) as { rows?: ImportRow[] };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rows = body.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "No rows to import — send { rows: [{ name, email, plan }] }." },
      { status: 400 },
    );
  }
  if (rows.length > 500) {
    return NextResponse.json(
      { error: "Too many rows — import at most 500 at a time." },
      { status: 400 },
    );
  }

  const skipped: Array<{ row: string; reason: string }> = [];
  let created = 0;

  for (const raw of rows) {
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const email =
      typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
    const plan = typeof raw.plan === "string" ? raw.plan.trim().toLowerCase() : "free";
    const label = `${name || "(no name)"} <${email || "(no email)"}>`;

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      skipped.push({ row: label, reason: "Name and a valid email are required." });
      continue;
    }
    if (!(PLANS as readonly string[]).includes(plan)) {
      skipped.push({ row: label, reason: "Plan must be free, starter or pro." });
      continue;
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      skipped.push({ row: label, reason: "A customer with this email already exists — skipped, not overwritten." });
      continue;
    }

    await prisma.customer.create({ data: { name, email, plan: plan as Plan } });
    created += 1;
  }

  return NextResponse.json({ ok: true, created, skipped });
}
