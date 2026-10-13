import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// One saved photo's image bytes. Parent-only, and only for their own child's
// session — checked via the session relation, not just the frame's own id.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; frameId: string }> }) {
  const { id, frameId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") return new Response("Unauthorized", { status: 401 });

  const frame = await prisma.screenShareFrame.findFirst({
    where: { id: frameId, sessionId: id },
    select: { image: true, session: { select: { student: { select: { parentId: true } } } } },
  });
  if (!frame || frame.session.student.parentId !== session.user.id) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(frame.image), {
    headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=86400" },
  });
}
