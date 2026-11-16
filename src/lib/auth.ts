import { auth } from "@/auth";

/**
 * Auth helpers for the starter kit.
 *
 * Real auth is Auth.js (NextAuth v5) — see src/auth.ts. Users sign up
 * with email + password; passwords are bcrypt-hashed in the database.
 * There is no demo provider and no demo user in this kit.
 *
 * The rest of the app only depends on getSessionUser() below.
 */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "starter" | "pro";
};

/** Server-side session lookup used by pages. Returns null when logged out. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email,
    plan: session.user.plan ?? "free",
  };
}
