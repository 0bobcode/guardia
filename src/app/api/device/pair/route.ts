import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// The companion Android app calls this once, right after the parent types
// in the pairing code shown in TrustEd. Trades the short human-entered code
// for the long-lived token the app authenticates with from then on.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const pairCode = typeof body?.pairCode === "string" ? body.pairCode.trim().toUpperCase() : "";
  const deviceName = typeof body?.deviceName === "string" ? body.deviceName.slice(0, 80) : null;

  if (!pairCode) {
    return NextResponse.json({ error: "pairCode is required" }, { status: 400 });
  }

  const pairing = await prisma.devicePairing.findUnique({
    where: { pairCode },
    include: { student: true },
  });

  if (!pairing) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
  }

  await prisma.devicePairing.update({
    where: { id: pairing.id },
    data: { pairedAt: new Date(), lastSeenAt: new Date(), deviceName },
  });

  return NextResponse.json({
    token: pairing.token,
    studentName: pairing.student.name,
  });
}
