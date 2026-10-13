import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// The latest frame, only while the session is live. Parent-only.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") return new Response("Unauthorized", { status: 401 });

  const s = await prisma.screenShareSession.findUnique({
    where: { id },
    select: { status: true, lastFrame: true, student: { select: { parentId: true } } },
  });
  if (!s || s.student.parentId !== session.user.id) return new Response("Not found", { status: 404 });
  if (s.status !== "ACTIVE" || !s.lastFrame) return new Response(null, { status: 204 });

  return new Response(new Uint8Array(s.lastFrame), {
    headers: { "content-type": "image/jpeg", "cache-control": "no-store, max-age=0" },
  });
}
