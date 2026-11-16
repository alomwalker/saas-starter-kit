import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan: "free" | "starter" | "pro";
    };
  }
  interface User {
    plan?: "free" | "starter" | "pro";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    plan?: "free" | "starter" | "pro";
  }
}
