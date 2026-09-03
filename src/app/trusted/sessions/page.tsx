import Link from "next/link";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { RiskBadge } from "@/components/RiskBadge";
import { ProviderBadge } from "@/components/ProviderBadge";
import { formatDateTime } from "@/lib/format";
import type { RiskLevel } from "@prisma/client";

const RISK_RANK: Record<RiskLevel, number> = { NONE: 0, LOW: 1, MED: 2, HIGH: 3 };

function worstRisk(levels: RiskLevel[]): RiskLevel {
  return levels.reduce((worst, l) => (RISK_RANK[l] > RISK_RANK[worst] ? l : worst), "NONE" as RiskLevel);
}

export default async function SessionsPage() {
  const session = await requireRole("PARENT");
  const parentId = session.user.id;

  const students = await prisma.student.findMany({ where: { parentId } });
  const studentIds = students.map((s) => s.id);

  const sessions = await prisma.aiSession.findMany({
    where: { studentId: { in: studentIds } },
    orderBy: { startedAt: "desc" },
    include: { app: true, student: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="px-6 py-8">
      <h1 className="text-xl font-semibold text-app-text mb-1">Session Monitor</h1>
      <p className="text-sm text-app-muted mb-6">
        Full transcripts of your child&apos;s AI conversations, scanned turn-by-turn by GuardRail.
      </p>

      <div className="space-y-3">
        {sessions.map((s) => {
          const risk = worstRisk(s.messages.map((m) => m.riskLevel));
          const studentTurns = s.messages.filter((m) => m.role === "STUDENT").length;
          const durationMin = s.endedAt
            ? Math.max(1, Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60000))
            : 0;
          const preview = s.messages[0]?.content ?? "";

          return (
            <Link
              key={s.id}
              href={`/trusted/sessions/${s.id}`}
              className="app-card block rounded-xl p-5 transition-colors hover:border-app-border-strong group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-app-text">{s.app.name}</p>
                    <ProviderBadge provider={s.app.provider} appName={s.app.name} />
                    <span className="text-app-faint text-xs">·</span>
                    <p className="text-sm text-app-muted">{s.student.name}</p>
                    <RiskBadge level={risk} />
                  </div>
                  <p className="text-sm text-app-muted mt-2 truncate max-w-xl">&ldquo;{preview}&rdquo;</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-app-faint">
                    <span>{formatDateTime(s.startedAt)}</span>
                    <span>{durationMin} min</span>
                    <span>{studentTurns} message{studentTurns === 1 ? "" : "s"}</span>
                  </div>
                </div>
                <span className="text-app-faint group-hover:text-app-teal transition-colors shrink-0 mt-1">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
        {sessions.length === 0 && (
          <div className="app-card rounded-xl p-8 text-center text-sm text-app-muted">
            No sessions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
