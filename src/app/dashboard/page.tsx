import { Badge, Card } from "@/components/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function RevenueChart({ series }: { series: Array<{ month: string; revenue: number }> }) {
  const max = Math.max(1, ...series.map((r) => r.revenue));
  return (
    <div className="flex h-40 items-end gap-1.5">
      {series.map((r) => (
        <div key={r.month} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-brand-500"
            style={{ height: `${Math.max(2, (r.revenue / max) * 140)}px` }}
            title={`${r.month}: $${r.revenue.toLocaleString()}`}
          />
          <span className="text-[10px] text-slate-500">{r.month}</span>
        </div>
      ))}
    </div>
  );
}

const PLAN_LABEL: Record<string, string> = { free: "Free", starter: "Starter", pro: "Pro" };
const STATUS_LABEL: Record<string, string> = { Active: "Active", Trial: "Trial", PastDue: "Past due" };

/**
 * Overview dashboard — every number comes from the database
 * (Prisma / src/lib/db.ts). The seed script fills it with clearly
 * labelled sample data; replace those rows with real customers and
 * revenue as the business grows. No demo data file exists anymore.
 */
export default async function DashboardPage() {
  const [customers, revenueRows] = await Promise.all([
    prisma.customer.findMany({ orderBy: { joinedAt: "desc" } }),
    prisma.monthlyRevenue.findMany({ orderBy: { monthKey: "asc" } }),
  ]);

  const active = customers.filter((c) => c.status === "Active").length;
  const pastDue = customers.filter((c) => c.status === "PastDue").length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newSignups = customers.filter((c) => c.joinedAt >= thirtyDaysAgo).length;
  const latest = revenueRows[revenueRows.length - 1];
  const previous = revenueRows[revenueRows.length - 2];
  const mrr = latest?.revenue ?? 0;
  const mrrChange =
    latest && previous && previous.revenue > 0
      ? `${(((latest.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1)}%`
      : "—";
  const churn = customers.length > 0 ? `${((pastDue / customers.length) * 100).toFixed(1)}%` : "0%";

  const stats = [
    { label: "Monthly recurring revenue", value: `$${mrr.toLocaleString()}`, change: `${mrrChange} vs last month` },
    { label: "Active customers", value: String(active), change: `${customers.length} total customers` },
    { label: "Churn rate", value: churn, change: `${pastDue} past due` },
    { label: "New signups (30d)", value: String(newSignups), change: "last 30 days" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
      <p className="mt-1 text-slate-600">
        Your business at a glance — live from your database. The figures below
        start as labelled sample data (see README § Database); replace them
        with real customers as you grow.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm text-emerald-600">{s.change}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-slate-900">Revenue — last 12 months</h2>
        <div className="mt-4">
          {revenueRows.length > 0 ? (
            <RevenueChart series={revenueRows} />
          ) : (
            <p className="text-sm text-slate-500">No revenue recorded yet.</p>
          )}
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Recent customers</h2>
          <Badge tone="brand">{newSignups} this month</Badge>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Plan</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr className="border-t border-slate-100">
                <td colSpan={4} className="px-6 py-4 text-slate-500">
                  No customers yet — they will appear here once someone signs up or buys.
                </td>
              </tr>
            ) : (
              customers.slice(0, 10).map((c) => (
                <tr key={c.email} className="border-t border-slate-100">
                  <td className="px-6 py-3">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-slate-500">{c.email}</p>
                  </td>
                  <td className="px-6 py-3 capitalize text-slate-700">{PLAN_LABEL[c.plan] ?? c.plan}</td>
                  <td className="px-6 py-3">
                    <Badge tone={c.status === "Active" ? "green" : c.status === "Trial" ? "brand" : "amber"}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-slate-700">
                    {c.joinedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
