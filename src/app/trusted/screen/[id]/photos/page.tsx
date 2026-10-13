import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { SAVED_FRAME_RETENTION_DAYS } from "@/lib/screenShare";

export default async function ScreenViewPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("PARENT");
  const s = await prisma.screenShareSession.findUnique({
    where: { id },
    include: { student: { select: { name: true, parentId: true } } },
  });
  if (!s || s.student.parentId !== session.user.id) notFound();

  const frames = await prisma.screenShareFrame.findMany({
    where: { sessionId: id },
    orderBy: { capturedAt: "asc" },
    select: { id: true, capturedAt: true },
  });

  return (
    <div className="px-6 py-8 max-w-4xl">
      <Link href={`/trusted/screen/${id}`} className="text-xs text-app-muted hover:text-app-text">← Back</Link>
      <h1 className="text-xl font-semibold text-app-text mt-2 mb-1">
        {s.student.name}&apos;s screen — {formatDateTime(s.requestedAt)}
      </h1>
      <p className="text-xs text-app-muted mb-6">
        {frames.length} photo{frames.length === 1 ? "" : "s"}, sampled roughly every 10 seconds during this view. Deleted
        automatically {SAVED_FRAME_RETENTION_DAYS} days after they were taken.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {frames.map((f) => (
          <div key={f.id} className="app-card rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/screen/${id}/photos/${f.id}`} alt={`Screen at ${formatDateTime(f.capturedAt)}`} className="w-full h-auto block" />
            <p className="text-[10px] text-app-muted px-2 py-1.5">{formatDateTime(f.capturedAt)}</p>
          </div>
        ))}
      </div>
      {frames.length === 0 && <p className="text-sm text-app-muted">No photos were saved for this session.</p>}
    </div>
  );
}
