import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/waitlist/export — downloads the launch waitlist as CSV
 * (signed-in users only). Columns: email, name, joined. Fields are
 * CSV-escaped; the file downloads as waitlist.csv. Mirrors
 * /api/customers/export.
 */
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const signups = await prisma.waitlistSignup.findMany({
    orderBy: { createdAt: "desc" },
  });

  const escape = (value: string): string =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  const header = "email,name,joined";
  const lines = signups.map((w) =>
    [
      escape(w.email),
      escape(w.name ?? ""),
      w.createdAt.toISOString().slice(0, 10),
    ].join(","),
  );

  return new NextResponse([header, ...lines].join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="waitlist.csv"',
    },
  });
}
