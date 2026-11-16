import { handlers } from "@/auth";

// Auth.js route handler: /api/auth/signin, /api/auth/session,
// /api/auth/signout, /api/auth/csrf, and the credentials callback.
// The login/signup pages call these via signIn("credentials", …)
// from next-auth/react — there is no custom password handling here.
export const { GET, POST } = handlers;
