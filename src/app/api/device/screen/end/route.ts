import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { pairedDevice } from "@/lib/screenShare";

// The child stopping a screen view early from their device. If the parent set
// a Screen Time passcode for this device (the same one that guards unpairing),
// it must be given — and it's checked here against the server-side hash, never
// on the device. Declining a request, the parent ending it, and the automatic
// time limit never need it. Deletes the stored frame.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const device = await pairedDevice(typeof body?.token === "string" ? body.token : null);
  if (!device) return NextResponse.json({ error: "Unknown or unpaired device" }, { status: 401 });
  const id = typeof body?.id === "string" ? body.id : "";
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  if (device.unpairPasswordHash) {
    const rl = rateLimit(`screen-end:${device.id}`, { limit: 8, windowMs: 10 * 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many attempts, try again later" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
    }
    if (!(await bcrypt.compare(passcode, device.unpairPasswordHash))) {
      return NextResponse.json({ error: "Incorrect passcode" }, { status: 403 });
    }
  }

  await prisma.screenShareSession.updateMany({
    where: { id, studentId: device.studentId, deviceId: device.id, status: { in: ["REQUESTED", "ACTIVE"] } },
    data: { status: "ENDED", endedAt: new Date(), endedBy: "CHILD", lastFrame: null },
  });
  return NextResponse.json({ ok: true });
}
