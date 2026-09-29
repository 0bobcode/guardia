import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { RiskBadge } from "@/components/RiskBadge";
import { ProviderBadge } from "@/components/ProviderBadge";
import { StudentAvatar } from "@/components/parent-app/StudentAvatar";
import { formatDateTime } from "@/lib/format";
import type { RiskLevel } from "@prisma/client";

const RISK_RANK: Record<RiskLevel, number> = { NONE: 0, LOW: 1, MED: 2, HIGH: 3 };

function worstRisk(levels: RiskLevel[]): RiskLevel {
  return levels.reduce((worst, l) => (RISK_RANK[l] > RISK_RANK[worst] ? l : worst), "NONE" as RiskLevel);
}

export default async function ParentAppSessions() {
  const session = await requireRole("PARENT");
  const students = await prisma.student.findMany({ where: { parentId: session.user.id } });
  const studentIds = students.map((s) => s.id);

  const sessions = await prisma.aiSession.findMany({
    where: { studentId: { in: studentIds } },
    orderBy: { startedAt: "desc" },
    take: 25,
    include: { app: true, student: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="px-5 pt-5 pb-6">
      <h1 className="text-lg font-semibold text-app-text mb-1">Sessions</h1>
      <p className="text-xs text-app-muted mb-4">Recent AI conversations, scanned by GuardRail.</p>

      <div className="space-y-2.5">
        {sessions.map((s) => {
          const risk = worstRisk(s.messages.map((m) => m.riskLevel));
          const preview = s.messages[0]?.content ?? "";

          return (
            <div key={s.id} className="app-card rounded-xl p-3.5 flex gap-3">
              {students.length > 1 && <StudentAvatar name={s.student.name} size={30} />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-app-text">{s.app.name}</p>
                  <ProviderBadge provider={s.app.provider} appName={s.app.name} />
                  <RiskBadge level={risk} />
                </div>
                {students.length > 1 && <p className="text-[11px] text-app-faint mt-1">{s.student.name}</p>}
                {preview && <p className="text-xs text-app-muted mt-1.5 line-clamp-2">&ldquo;{preview}&rdquo;</p>}
                <p className="text-[11px] text-app-faint mt-2">{formatDateTime(s.startedAt)}</p>
              </div>
            </div>
          );
        })}
        {sessions.length === 0 && (
          <div className="app-card rounded-xl p-6 text-center text-xs text-app-muted">No sessions recorded yet.</div>
        )}
      </div>
    </div>
  );
}
