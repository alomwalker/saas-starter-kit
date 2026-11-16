import { prisma } from "@/lib/db";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

/** Settings page — reads the workspace row from the database. */
export default async function SettingsPage() {
  const setting = await prisma.setting.findUnique({ where: { id: "workspace" } });
  return (
    <SettingsForm
      initial={{
        workspaceName: setting?.workspaceName ?? "My SaaS",
        contactEmail: setting?.contactEmail ?? "",
      }}
    />
  );
}
