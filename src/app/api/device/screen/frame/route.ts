import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { expireStale, MAX_FRAME_BYTES, SAVED_FRAME_INTERVAL_MS, pairedDevice } from "@/lib/screenShare";

// One JPEG frame of the child's screen. Accepted ONLY while the session is
// ACTIVE (the child said yes and neither side has ended it). The reply tells
// the device whether to keep sending — when the parent ends the view, it
// stops. This always updates the single live-view frame (replaced each
// time); separately, roughly once per SAVED_FRAME_INTERVAL_MS, it's also
// kept as a ScreenShareFrame row for the parent to review later — exactly
// what the consent prompt told the child would happen.
export async function POST(req: Request) {
  const device = await pairedDevice(req.headers.get("x-guardia-token"));
  if (!device) return NextResponse.json({ error: "Unknown or unpaired device" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";

  await expireStale(device.studentId);
  const session = await prisma.screenShareSession.findFirst({
    where: { id, studentId: device.studentId, deviceId: device.id },
    select: { status: true, lastFrameAt: true, frames: { orderBy: { capturedAt: "desc" }, take: 1, select: { capturedAt: true } } },
  });
  if (!session || session.status !== "ACTIVE") return NextResponse.json({ ok: true, active: false });

  if (session.lastFrameAt && Date.now() - session.lastFrameAt.getTime() < 400) {
    return NextResponse.json({ ok: true, active: true }); // too fast — drop this frame
  }
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_FRAME_BYTES) {
    return NextResponse.json({ error: "Bad frame size" }, { status: 413 });
  }
  // JPEG magic number — refuse anything else.
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return NextResponse.json({ error: "Not a JPEG" }, { status: 415 });

  const lastSaved = session.frames[0]?.capturedAt;
  const shouldSave = !lastSaved || Date.now() - lastSaved.getTime() >= SAVED_FRAME_INTERVAL_MS;

  await prisma.screenShareSession.update({
    where: { id },
    data: {
      lastFrame: bytes,
      lastFrameAt: new Date(),
      frameCount: { increment: 1 },
      ...(shouldSave && { frames: { create: { image: bytes } } }),
    },
  });
  return NextResponse.json({ ok: true, active: true });
}
