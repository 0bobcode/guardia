import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { expireStale, pairedDevice, REQUEST_TTL_MS } from "@/lib/screenShare";

// The device asks "does a parent want to view my screen?". Nothing about the
// screen is read or sent here — this only reports a pending request.
export async function POST(req: Request) {
  const rl = rateLimit(`screen-poll:${clientIp(req)}`, { limit: 40, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const device = await pairedDevice(typeof body?.token === "string" ? body.token : null);
  if (!device) return NextResponse.json({ error: "Unknown or unpaired device" }, { status: 401 });

  await expireStale(device.studentId);
  const session = await prisma.screenShareSession.findFirst({
    where: { studentId: device.studentId, deviceId: device.id, status: { in: ["REQUESTED", "ACTIVE"] } },
    orderBy: { requestedAt: "desc" },
  });
  if (!session) return NextResponse.json({ request: null, active: null });
  const endNeedsPasscode = !!device.unpairPasswordHash;

  if (session.status === "ACTIVE") return NextResponse.json({ request: null, active: { id: session.id, endNeedsPasscode } });

  const parent = await prisma.user.findUnique({ where: { id: session.requestedById }, select: { name: true } });
  return NextResponse.json({
    request: {
      id: session.id,
      parentName: parent?.name ?? "Your parent",
      expiresInSec: Math.max(0, Math.round((session.requestedAt.getTime() + REQUEST_TTL_MS - Date.now()) / 1000)),
      endNeedsPasscode,
    },
    active: null,
  });
}
