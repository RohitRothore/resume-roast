import { DEFAULT_RATE_LIMIT_PER_DAY } from "./constants";

type Bucket = { count: number; day: string };

const store = new Map<string, Bucket>();

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(ip: string): {
  ok: boolean;
  remaining: number;
  limit: number;
} {
  const limit = Number(process.env.RATE_LIMIT_PER_DAY) || DEFAULT_RATE_LIMIT_PER_DAY;
  const day = utcDay();
  const existing = store.get(ip);

  if (!existing || existing.day !== day) {
    store.set(ip, { count: 1, day });
    return { ok: true, remaining: limit - 1, limit };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, limit };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, limit };
}
