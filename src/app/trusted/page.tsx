import Link from "next/link";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { ProviderBadge } from "@/components/ProviderBadge";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function TrustedDashboard() {
  const session = await requireRole("PARENT");
  const parentId = session!.user.id;

  const students = await prisma.student.findMany({
    where: { parentId },
    include: {
      enrollments: { include: { app: true } },
      district: true,
    },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const studentIds = students.map((s) => s.id);
  const todaysFlags = await prisma.scanEvent.findMany({
    where: { studentId: { in: studentIds }, riskLevel: { not: "NONE" }, createdAt: { gte: startOfDay } },
    include: { app: true },
  });
  const pendingConsents = await prisma.consentRequest.findMany({
    where: { studentId: { in: studentIds }, status: "PENDING" },
    include: { app: true, student: true },
  });
  const recentSessions = await prisma.aiSession.findMany({
    where: { studentId: { in: studentIds } },
    orderBy: { startedAt: "desc" },
    take: 3,
    include: { app: true, student: true, messages: true },
  });

  return (
    <div className="px-6 py-8">
      {students.map((student) => {
        const totalMinutes = student.enrollments.reduce((sum, e) => sum + e.usedTodayMin, 0);
        const flagsForStudent = todaysFlags.filter((f) => f.studentId === student.id);
        const consentsForStudent = pendingConsents.filter((c) => c.studentId === student.id);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;

        return (
          <div key={student.id} className="mb-10">
            <h1 className="text-xl font-semibold text-app-text">
              {greeting()}, {session!.user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-app-muted mt-1">
              {student.name}&apos;s {student.enrollments.length} school apps are monitored · Live
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-6">
              <div className="app-card rounded-xl p-5">
                <p className="text-xs text-app-muted mb-1">Today&apos;s screen time</p>
                <p className="text-2xl font-bold text-app-text">
                  {h}h {m.toString().padStart(2, "0")}m
                </p>
              </div>
              <div className="app-card rounded-xl p-5">
                <p className="text-xs text-app-muted mb-1">Content flags</p>
                <p className={`text-2xl font-bold ${flagsForStudent.length ? "text-amber-400" : "text-app-text"}`}>
                  {flagsForStudent.length} flag{flagsForStudent.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="app-card rounded-xl p-5">
                <p className="text-xs text-app-muted mb-1">Pending consents</p>
                <p className={`text-2xl font-bold ${consentsForStudent.length ? "text-app-teal" : "text-app-text"}`}>
                  {consentsForStudent.length} pending
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {student.enrollments.map((e) => {
                const hasFlag = flagsForStudent.some((f) => f.appId === e.appId);
                return (
                  <div
                    key={e.id}
                    className="app-card rounded-xl p-4 flex items-center justify-between transition-colors hover:border-app-border-strong"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-app-text">{e.app.name}</p>
                        <ProviderBadge provider={e.app.provider} appName={e.app.name} />
                      </div>
                      <p className="text-xs text-app-muted">{e.app.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-app-text">
                        🕐 {Math.floor(e.usedTodayMin / 60)}h {(e.usedTodayMin % 60).toString().padStart(2, "0")}m
                      </p>
                      <p className={`text-xs font-medium ${hasFlag ? "text-amber-400" : "text-emerald-400"}`}>
                        {hasFlag ? "⚠ 1 Flag" : "✓ Safe"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {consentsForStudent.map((c) => (
              <div key={c.id} className="bg-app-teal-soft border border-app-teal/30 rounded-xl p-4 mb-3">
                <p className="text-xs font-semibold text-app-teal uppercase mb-1">Consent Required</p>
                <p className="text-sm text-app-text">{c.reason}</p>
                <p className="text-xs text-app-muted mt-1">
                  Requested {Math.round((Date.now() - c.createdAt.getTime()) / 60000)} min ago
                </p>
                <Link
                  href="/trusted/consents"
                  className="inline-block mt-3 text-xs font-semibold px-4 py-2 rounded-md bg-app-teal text-[#04211d] hover:opacity-90 transition-opacity"
                >
                  Review request →
                </Link>
              </div>
            ))}
          </div>
        );
      })}

      <div className="app-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-app-text">Monitor AI Sessions</h2>
            <p className="text-xs text-app-muted mt-0.5">Full conversation transcripts, scanned turn-by-turn.</p>
          </div>
          <Link href="/trusted/sessions" className="text-xs font-medium text-app-teal hover:underline shrink-0">
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {recentSessions.map((s) => {
            const hasFlag = s.messages.some((m) => m.riskLevel !== "NONE");
            return (
              <Link
                key={s.id}
                href={`/trusted/sessions/${s.id}`}
                className="flex items-center justify-between text-sm rounded-lg px-3 py-2.5 bg-app-surface-2/50 hover:bg-app-surface-2 transition-colors"
              >
                <div className="min-w-0">
                  <span className="text-app-text font-medium">{s.app.name}</span>
                  <span className="text-app-faint mx-2">·</span>
                  <span className="text-app-muted">{s.student.name}</span>
                </div>
                <span className={`text-xs font-medium shrink-0 ml-3 ${hasFlag ? "text-amber-400" : "text-emerald-400"}`}>
                  {hasFlag ? "Flagged" : "Safe"}
                </span>
              </Link>
            );
          })}
          {recentSessions.length === 0 && (
            <p className="text-sm text-app-muted py-4 text-center">No sessions recorded yet.</p>
          )}
        </div>
      </div>

      {students.length === 0 && (
        <p className="text-sm text-app-muted py-12 text-center">No children linked to this account yet.</p>
      )}
    </div>
  );
}
