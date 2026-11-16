import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * Real auth for the starter kit — Auth.js (NextAuth v5).
 *
 * Three ways to sign in (each is only offered when its keys are
 * configured — see the providers list below and .env.example):
 *   1. Email + password (credentials) — always on. Passwords are
 *      stored as bcrypt hashes in the database; there is NO demo
 *      user and NO demo login.
 *   2. Google — OAuth via the buyer's own Google Cloud client
 *      (AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET).
 *   3. Magic link — a sign-in link emailed via Resend
 *      (RESEND_API_KEY), using Auth.js's email provider.
 *
 * Session strategy is JWT. This is deliberate, not a shortcut:
 * Auth.js's Credentials provider only supports JWT sessions —
 * database sessions are incompatible with it (Auth.js docs,
 * Credentials provider). The JWT is signed with AUTH_SECRET
 * (see .env.example — generate a long random value, never commit
 * it). Users, subscriptions and all dashboard data still live in
 * the database; only the session token itself is a signed JWT.
 * The Prisma adapter is wired so the User/Account/Session tables
 * exist for Auth.js — the magic-link provider needs the adapter
 * (it stores its tokens in VerificationToken), and Google sign-in
 * creates the User + Account rows through it.
 *
 * ACCOUNT LINKING — read this before changing it. Auth.js's
 * default is deliberately kept: a Google sign-in whose email
 * already belongs to a credentials account is REJECTED with an
 * OAuthAccountNotLinked error — the Google account does NOT
 * silently take over the password account (that would let anyone
 * who controls a Google account with your email steal the
 * account). A user in that situation signs in with their
 * password, or the seller explicitly enables linking for a
 * verified provider (allowDangerousEmailAccountLinking — see
 * Auth.js docs; only do this if you understand the trade-off).
 * The same rule applies in reverse: a Google-created account has
 * no password (passwordHash is null) and cannot log in with
 * credentials until a password is set.
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
        // No account, or a Google-only account with no password set.
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, plan: user.plan };
      },
    }),
    // Google OAuth — only registered when the buyer configured it.
    // Without AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET the button is
    // hidden (the login page checks the same env vars) and this
    // provider simply does not exist.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    // Magic link via Resend — only registered when configured.
    // Needs the Prisma adapter (tokens live in VerificationToken).
    // Sessions stay JWT: the link verifies the token, then Auth.js
    // issues a signed JWT like any other sign-in.
    ...(process.env.RESEND_API_KEY
      ? [
          Resend({
            apiKey: process.env.RESEND_API_KEY,
            from:
              process.env.EMAIL_FROM?.trim() ||
              "SaaS Starter <onboarding@resend.dev>",
          }),
        ]
      : []),
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
