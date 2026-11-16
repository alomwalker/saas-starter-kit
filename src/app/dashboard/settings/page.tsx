import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

/** Settings page — reads the workspace row from the database. */
export default async function SettingsPage() {
  const setting = await prisma.setting.findUnique({ where: { id: "workspace" } });
  // Whether the signed-in account has a password at all: Google-only
  // and magic-link accounts have none, so the password form is
  // replaced with a note pointing at the reset flow.
  const session = await getSessionUser();
  const user = session
    ? await prisma.user.findUnique({
        where: { email: session.email },
        select: { passwordHash: true },
      })
    : null;
  return (
    <SettingsForm
      initial={{
        workspaceName: setting?.workspaceName ?? "My SaaS",
        contactEmail: setting?.contactEmail ?? "",
      }}
      hasPassword={Boolean(user?.passwordHash)}
    />
  );
}
