import { signOut } from "@/auth";

/** Logs the user out via Auth.js and sends them to the login page. */
export async function POST() {
  await signOut({ redirectTo: "/auth/login" });
}
