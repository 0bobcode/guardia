import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rateLimit";

// The browser extension (or companion app) calls this to unpair itself.
// The password, if the parent set one from TrustEd's Settings page, is
// checked here against the server-stored hash — never against anything
// stored locally in the extension — so a parent can gate or change it
// remotely without touching the child's browser.
export async function POST(req: Request) {
  const { allowed, retryAfterSeconds } = rateLimit(`device-unpair:${clientIp(req)}`, {
    limit: 8,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts, try again shortly" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token) return NextResponse.json({ error: "token is required" }, { status: 401 });

  const pairing = await prisma.devicePairing.findUnique({ where: { token } });
  if (!pairing) {
    // Already gone — treat as a successful unpair so the extension can clear itself.
    return NextResponse.json({ ok: true });
  }

  if (pairing.unpairPasswordHash) {
    const matches = await bcrypt.compare(password, pairing.unpairPasswordHash);
    if (!matches) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }
  }

  await prisma.devicePairing.delete({ where: { id: pairing.id } });

  return NextResponse.json({ ok: true });
}
