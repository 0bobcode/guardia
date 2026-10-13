import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { ScreenViewer } from "@/components/ScreenViewer";
import { SAVED_FRAME_RETENTION_DAYS } from "@/lib/screenShare";
import { stopScreenShareAction } from "../actions";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Waiting",
  ACTIVE: "Live",
  ENDED: "Ended",
  DECLINED: "Declined",
  EXPIRED: "No answer",
};

export default async function ScreenViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("PARENT");
  const s = await prisma.screenShareSession.findUnique({ where: { id }, include: { student: { select: { id: true, name: true, parentId: true } } } });
  if (!s || s.student.parentId !== session.user.id) notFound();

  const device = await prisma.devicePairing.findUnique({ where: { id: s.deviceId }, select: { unpairPasswordHash: true } });
  const history = await prisma.screenShareSession.findMany({
    where: { studentId: s.studentId },
    orderBy: { requestedAt: "desc" },
    take: 8,
    select: {
      id: true,
      status: true,
      requestedAt: true,
      respondedAt: true,
      endedAt: true,
      endedBy: true,
      _count: { select: { frames: true } },
    },
  });

  return (
    <div className="px-6 py-8 max-w-3xl">
      <Link href="/trusted/settings" className="text-xs text-app-muted hover:text-app-text">← Back</Link>
      <h1 className="text-xl font-semibold text-app-text mt-2 mb-1">{s.student.name}&apos;s screen</h1>
      <p className="text-xs text-app-muted mb-6">
        Only shown if {s.student.name} agrees, each time — they&apos;re told exactly this when asked. They see a sharing notice on
        their device the whole time, and it ends on its own after the time limit (15 minutes). A photo is saved roughly every 10
        seconds for you to review afterward, kept for {SAVED_FRAME_RETENTION_DAYS} days and then deleted automatically.{" "}
        {device?.unpairPasswordHash
          ? `To end it early from their device, ${s.student.name} needs your Screen Time passcode.`
          : "Tip: set a Screen Time passcode in Settings so they need it to end a view early; without one they can stop it themselves."}
      </p>

      <ScreenViewer id={id} studentName={s.student.name} stopAction={stopScreenShareAction} />

      <h2 className="text-sm font-semibold text-app-text mt-10 mb-3">Screen view history</h2>
      <div className="app-card rounded-xl divide-y divide-app-border">
        {history.map((h) => {
          const secs = h.respondedAt && h.endedAt ? Math.round((h.endedAt.getTime() - h.respondedAt.getTime()) / 1000) : null;
          return (
            <div key={h.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
              <div>
                <span className="text-app-text">{formatDateTime(h.requestedAt)}</span>
                <span className="text-app-muted">
                  {" "}
                  — {STATUS_LABEL[h.status]}
                  {h.status === "ENDED" && secs !== null ? ` · ${Math.floor(secs / 60)}m ${secs % 60}s` : ""}
                  {h.endedBy && h.status === "ENDED" ? ` · by ${h.endedBy === "PARENT" ? "you" : h.endedBy === "CHILD" ? "child" : "timeout"}` : ""}
                </span>
              </div>
              {h._count.frames > 0 && (
                <Link href={`/trusted/screen/${h.id}/photos`} className="text-app-teal font-medium hover:underline shrink-0 ml-3">
                  View {h._count.frames} photo{h._count.frames === 1 ? "" : "s"} →
                </Link>
              )}
            </div>
          );
        })}
        {history.length === 0 && <p className="text-xs text-app-muted px-4 py-3">No screen views yet.</p>}
      </div>
    </div>
  );
}
