import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { weightedRiskScore, countByRiskLevel } from "@/lib/risk";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { AskGuardia } from "@/components/AskGuardia";
import { StudentAvatar } from "@/components/parent-app/StudentAvatar";
import { askGuardiaForStudent } from "../../trusted/askActions";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function ParentAppHome() {
  const session = await requireRole("PARENT");
  const parentId = session.user.id;

  const students = await prisma.student.findMany({
    where: { parentId },
    include: { enrollments: true },
    orderBy: { name: "asc" },
  });
  const student = students[0];

  if (!student) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-app-muted">No students linked to your account yet.</p>
      </div>
    );
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const flagsToday = await prisma.scanEvent.findMany({
    where: { studentId: student.id, riskLevel: { not: "NONE" }, createdAt: { gte: startOfDay } },
  });
  const recentSessions = await prisma.aiSession.findMany({
    where: { studentId: student.id },
    orderBy: { startedAt: "desc" },
    take: 3,
    include: { app: true, messages: { select: { id: true } } },
  });

  const totalMinutes = student.enrollments.reduce((sum, e) => sum + e.usedTodayMin, 0);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const riskScore = weightedRiskScore(countByRiskLevel(flagsToday));

  return (
    <div className="px-5 pt-5 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <StudentAvatar name={student.name} size={44} />
        <div>
          <h1 className="text-lg font-semibold text-app-text">
            {greeting()}, {session.user.name.split(" ")[0]}
          </h1>
          <p className="text-xs text-app-muted mt-0.5">Watching over {student.name}</p>
        </div>
      </div>

      <AskGuardia
        ask={askGuardiaForStudent.bind(null, student.id)}
        placeholder={`Ask about ${student.name.split(" ")[0]}'s AI activity…`}
        examples={["What's been happening today?", "Any concerning topics?"]}
      />

      <div className="app-card rounded-xl p-4 flex items-center gap-4">
        <RiskGauge score={riskScore} size={84} />
        <div className="min-w-0">
          <p className="text-xs text-app-muted">Today&apos;s Safety Score</p>
          <p className="text-sm text-app-text mt-1">
            {flagsToday.length === 0 ? "No flags today" : `${flagsToday.length} flag${flagsToday.length === 1 ? "" : "s"} today`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="app-card rounded-xl p-4">
          <p className="text-[11px] text-app-muted mb-1">Screen time</p>
          <p className="text-xl font-bold text-app-text">
            {h}h {m.toString().padStart(2, "0")}m
          </p>
        </div>
        <div className="app-card rounded-xl p-4">
          <p className="text-[11px] text-app-muted mb-1">Apps monitored</p>
          <p className="text-xl font-bold text-app-text">{student.enrollments.length}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-app-muted uppercase tracking-wide mb-2">Recent sessions</p>
        <div className="space-y-2">
          {recentSessions.map((s) => (
            <div key={s.id} className="app-card rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-app-text truncate">{s.app.name}</p>
                <p className="text-[11px] text-app-faint mt-0.5">{s.messages.length} messages</p>
              </div>
            </div>
          ))}
          {recentSessions.length === 0 && (
            <div className="app-card rounded-xl p-4 text-center text-xs text-app-muted">No sessions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
