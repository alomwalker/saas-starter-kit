import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/customers/export — downloads every customer as CSV
 * (signed-in users only). Columns: name, email, plan, status,
 * joined date. Fields are CSV-escaped; the file downloads as
 * customers.csv.
 */
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const customers = await prisma.customer.findMany({
    orderBy: { joinedAt: "desc" },
  });

  const escape = (value: string): string =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  const header = "name,email,plan,status,joined";
  const lines = customers.map((c) =>
    [
      escape(c.name),
      escape(c.email),
      c.plan,
      c.status,
      c.joinedAt.toISOString().slice(0, 10),
    ].join(","),
  );

  return new NextResponse([header, ...lines].join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customers.csv"',
    },
  });
}
