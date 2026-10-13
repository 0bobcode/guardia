import { prisma } from "@/lib/db";

// A request the child never answers lapses; a session can't run forever; and
// if the device stops sending frames (app killed, phone off) the session
// ends itself rather than sitting "live" with a stale picture.
export const REQUEST_TTL_MS = 2 * 60_000;
export const MAX_SESSION_MS = 15 * 60_000;
export const STALE_FRAME_MS = 45_000;
export const MAX_FRAME_BYTES = 400_000;

// Not every live-view frame is kept for review — only a sample, roughly this
// often — and even those are deleted automatically after this many days.
// Both numbers are stated plainly in the consent prompt and privacy policy;
// changing them here means updating that wording too.
export const SAVED_FRAME_INTERVAL_MS = 10_000;
export const SAVED_FRAME_RETENTION_DAYS = 30;

export async function expireStale(studentId: string) {
  const now = Date.now();
  await prisma.screenShareSession.updateMany({
    where: { studentId, status: "REQUESTED", requestedAt: { lt: new Date(now - REQUEST_TTL_MS) } },
    data: { status: "EXPIRED", endedAt: new Date(), endedBy: "TIMEOUT" },
  });
  await prisma.screenShareSession.updateMany({
    where: { studentId, status: "ACTIVE", respondedAt: { lt: new Date(now - MAX_SESSION_MS) } },
    data: { status: "ENDED", endedAt: new Date(), endedBy: "TIMEOUT", lastFrame: null },
  });
  await prisma.screenShareSession.updateMany({
    where: {
      studentId,
      status: "ACTIVE",
      OR: [
        { lastFrameAt: { lt: new Date(now - STALE_FRAME_MS) } },
        { lastFrameAt: null, respondedAt: { lt: new Date(now - STALE_FRAME_MS) } },
      ],
    },
    data: { status: "ENDED", endedAt: new Date(), endedBy: "TIMEOUT", lastFrame: null },
  });

  // Saved review photos are deleted after the stated retention window no
  // matter what — this isn't conditional on anyone having looked at them.
  await prisma.screenShareFrame.deleteMany({
    where: {
      session: { studentId },
      capturedAt: { lt: new Date(now - SAVED_FRAME_RETENTION_DAYS * 24 * 60 * 60 * 1000) },
    },
  });
}

/** The paired device behind a device token, or null. */
export async function pairedDevice(token: string | null | undefined) {
  if (!token) return null;
  const pairing = await prisma.devicePairing.findUnique({
    where: { token },
    include: { student: { select: { id: true, name: true, parentId: true } } },
  });
  return pairing?.pairedAt ? pairing : null;
}
