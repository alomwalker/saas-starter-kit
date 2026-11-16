import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * Real auth for the starter kit — Auth.js (NextAuth v5) with a
 * credentials provider. No external account signup is needed:
 * users sign up with an email + password, the password is stored
 * as a bcrypt hash in the database (src/lib/db.ts / Prisma), and
 * login checks the hash. There is NO demo user and NO demo login.
 *
 * Session strategy is JWT. This is deliberate, not a shortcut:
 * Auth.js's Credentials provider only supports JWT sessions —
 * database sessions are incompatible with it (Auth.js docs,
 * Credentials provider). The JWT is signed with AUTH_SECRET
 * (see .env.example — generate a long random value, never commit
 * it). Users, subscriptions and all dashboard data still live in
 * the database; only the session token itself is a signed JWT.
 * The Prisma adapter is wired so the User/Account/Session tables
 * exist for Auth.js and for future OAuth providers.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Trust the Host header: required when the app runs behind a proxy
  // or on a port other than the one in NEXT_PUBLIC_APP_URL (Auth.js
  // otherwise rejects the request with "UntrustedHost"). Only run
  // behind a proxy you control.
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/auth/login" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, plan: user.plan };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const plan = (user as { plan?: string }).plan;
        token.plan = plan === "starter" || plan === "pro" ? plan : "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.plan = (token.plan as "free" | "starter" | "pro") ?? "free";
      }
      return session;
    },
  },
});
