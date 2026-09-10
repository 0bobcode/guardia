// In-memory sliding-window rate limiter. This resets per serverless
// instance rather than being globally consistent across Vercel's fleet —
// good enough to blunt casual brute-forcing (e.g. guessing device pairing
// codes) without adding a Redis/Upstash dependency this project otherwise
// has no use for. A real production deployment under sustained attack
// would want a shared store (Vercel KV/Upstash) instead of this.
const buckets = new Map<string, { count: number; windowStart: number }>();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
