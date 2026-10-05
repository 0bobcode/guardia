import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

// Stateless reset tokens: no DB table needed. The signature covers the
// user's *current* password hash, so a token stops working the moment the
// password changes (single-use) and can't be forged without AUTH_SECRET.

const TTL_MS = 30 * 60 * 1000;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is required to sign password reset tokens");
  return s;
}

function sign(payload: string, passwordHash: string): string {
  return createHmac("sha256", secret()).update(`${payload}.${passwordHash}`).digest("hex");
}

export function createResetToken(userId: string, passwordHash: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload, passwordHash)}`;
}

/** Returns the matching user (id + hash) if the token is genuine, unexpired,
 *  and the password hasn't changed since it was issued; otherwise null. */
export async function verifyResetToken(token: string): Promise<{ id: string; passwordHash: string } | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  let parsed: { uid?: unknown; exp?: unknown };
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed.uid !== "string" || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;

  const user = await prisma.user.findUnique({
    where: { id: parsed.uid },
    select: { id: true, passwordHash: true },
  });
  if (!user?.passwordHash) return null;

  const expected = Buffer.from(sign(payload, user.passwordHash), "hex");
  const given = Buffer.from(sig, "hex");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  return { id: user.id, passwordHash: user.passwordHash };
}
