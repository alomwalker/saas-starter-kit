import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Read the workspace settings (logged-in users only). */
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const setting = await prisma.setting.findUnique({ where: { id: "workspace" } });
  return NextResponse.json({
    workspaceName: setting?.workspaceName ?? "My SaaS",
    contactEmail: setting?.contactEmail ?? "",
  });
}

/** Persist workspace settings to the database (logged-in users only). */
export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { workspaceName, contactEmail } = (await req.json()) as {
    workspaceName?: string;
    contactEmail?: string;
  };
  const cleanName = (workspaceName ?? "").trim();
  const cleanEmail = (contactEmail ?? "").trim();
  if (!cleanName) {
    return NextResponse.json({ error: "Workspace name is required." }, { status: 400 });
  }
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Contact email is not a valid email." }, { status: 400 });
  }
  const saved = await prisma.setting.upsert({
    where: { id: "workspace" },
    update: { workspaceName: cleanName, contactEmail: cleanEmail },
    create: { id: "workspace", workspaceName: cleanName, contactEmail: cleanEmail },
  });
  return NextResponse.json({
    ok: true,
    workspaceName: saved.workspaceName,
    contactEmail: saved.contactEmail,
  });
}
