import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { expireStale, pairedDevice } from "@/lib/screenShare";

// The child's answer. Only the device paired to this child can answer, and
// only while the request is still open — this is the consent step.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const device = await pairedDevice(typeof body?.token === "string" ? body.token : null);
  if (!device) return NextResponse.json({ error: "Unknown or unpaired device" }, { status: 401 });
  const id = typeof body?.id === "string" ? body.id : "";
  const accept = body?.accept === true;

  await expireStale(device.studentId);
  const result = await prisma.screenShareSession.updateMany({
    where: { id, studentId: device.studentId, deviceId: device.id, status: "REQUESTED" },
    data: accept
      ? { status: "ACTIVE", respondedAt: new Date() }
      : { status: "DECLINED", respondedAt: new Date(), endedAt: new Date(), endedBy: "CHILD" },
  });
  return NextResponse.json({ ok: result.count === 1, accepted: accept && result.count === 1 });
}
