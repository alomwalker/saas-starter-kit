import { NextResponse } from "next/server";

/**
 * Simple in-memory per-IP rate limiting — no external service.
 *
 * 10 requests per minute per IP per endpoint on the public write
 * endpoints (waitlist signup, customer creation, auth signup),
 * each endpoint with its own bucket. This is a starter-kit guard
 * it lives in one server process's memory, so it does not share
 * state across instances — sellers running multiple instances
 * should swap it for Upstash Ratelimit or a Redis-backed limiter.
 * The window and limit are deliberately small and documented in
 * README § Rate limiting.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Hit = { count: number; resetAt: number };
const hits = new Map<string, Hit>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(ip: string, scope: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const key = `${scope}:${ip}`;
  const entry = hits.get(key);
  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  entry.count += 1;
  // Keep the map bounded: drop expired entries once in a while.
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (now >= value.resetAt) hits.delete(key);
    }
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitExceeded(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      error: `Too many requests — please wait ${retryAfterSeconds} seconds and try again.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}
