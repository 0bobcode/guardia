import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { expireStale, REQUEST_TTL_MS } from "@/lib/screenShare";

// Status of a screen view, for the parent's live page. Parent-only, and only
// for their own child's sessions.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const found = await prisma.screenShareSession.findUnique({ where: { id }, include: { student: { select: { name: true, parentId: true } } } });
  if (!found || found.student.parentId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await expireStale(found.studentId);
  const s = await prisma.screenShareSession.findUnique({
    where: { id },
    select: { status: true, requestedAt: true, respondedAt: true, endedAt: true, endedBy: true, lastFrameAt: true, frameCount: true },
  });
  return NextResponse.json({
    ...s,
    studentName: found.student.name,
    requestExpiresInSec: s?.status === "REQUESTED" ? Math.max(0, Math.round((found.requestedAt.getTime() + REQUEST_TTL_MS - Date.now()) / 1000)) : 0,
  });
}
