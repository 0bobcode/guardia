import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Lists saved photos for a session — timestamps only, never the image data
// itself (that's fetched per-photo below). Parent-only, own child only.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const found = await prisma.screenShareSession.findUnique({ where: { id }, select: { student: { select: { parentId: true } } } });
  if (!found || found.student.parentId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const frames = await prisma.screenShareFrame.findMany({
    where: { sessionId: id },
    orderBy: { capturedAt: "asc" },
    select: { id: true, capturedAt: true },
  });
  return NextResponse.json({ frames });
}
