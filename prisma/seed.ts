import { PrismaClient, type Plan } from "@prisma/client";

const prisma = new PrismaClient();

// Seed data — SAMPLE DATA, clearly labelled. These are fictional
// customers and revenue figures so a buyer can see the dashboard
// working immediately. They are workspace data, not accounts:
// this script creates NO loginable user (there is no demo login in
// this kit — see README § Auth). Replace or delete these rows with
// real data once the app is live. The script is idempotent: run it
// again and it upserts instead of duplicating.

const SAMPLE_CUSTOMERS: Array<{
  name: string;
  email: string;
  plan: Plan;
  status: "Active" | "Trial" | "PastDue";
  daysAgoJoined: number;
}> = [
  { name: "Ava Thompson", email: "ava@northwind.co", plan: "pro", status: "Active", daysAgoJoined: 4 },
  { name: "Liam O'Connor", email: "liam@harbor.io", plan: "starter", status: "Trial", daysAgoJoined: 5 },
  { name: "Maya Chen", email: "maya@brightline.dev", plan: "pro", status: "Active", daysAgoJoined: 6 },
  { name: "Noah Patel", email: "noah@fieldwork.app", plan: "starter", status: "Active", daysAgoJoined: 7 },
  { name: "Sofia Rossi", email: "sofia@atelier.it", plan: "pro", status: "PastDue", daysAgoJoined: 8 },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SAMPLE_REVENUE = [4200, 5100, 5800, 6900, 7600, 9100, 9800, 10400, 11200, 11800, 12480, 13200];

async function main() {
  const year = new Date().getFullYear();
  const now = new Date();

  for (const c of SAMPLE_CUSTOMERS) {
    const joinedAt = new Date(now);
    joinedAt.setDate(joinedAt.getDate() - c.daysAgoJoined);
    await prisma.customer.upsert({
      where: { email: c.email },
      update: { name: c.name, plan: c.plan, status: c.status, joinedAt },
      create: { name: c.name, email: c.email, plan: c.plan, status: c.status, joinedAt },
    });
  }

  for (let i = 0; i < 12; i++) {
    const monthKey = `${year}-${String(i + 1).padStart(2, "0")}`;
    await prisma.monthlyRevenue.upsert({
      where: { monthKey },
      update: { month: MONTHS[i], revenue: SAMPLE_REVENUE[i] },
      create: { monthKey, month: MONTHS[i], revenue: SAMPLE_REVENUE[i] },
    });
  }

  await prisma.setting.upsert({
    where: { id: "workspace" },
    update: {},
    create: { id: "workspace", workspaceName: "My SaaS", contactEmail: "" },
  });

  console.log("Seed complete: 5 sample customers, 12 months of sample revenue, workspace settings.");
  console.log("This is SAMPLE data — replace it with real data before launch (see README § Database).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
