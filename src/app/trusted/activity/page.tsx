import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { RiskBadge } from "@/components/RiskBadge";
import { WeekBars } from "@/components/charts/WeekBars";
import { formatDateTime, formatWeekday } from "@/lib/format";

export default async function ActivityPage() {
  const session = await requireRole("PARENT");
  const parentId = session!.user.id;

  const students = await prisma.student.findMany({
    where: { parentId },
    include: { enrollments: { include: { app: true } } },
  });
  const studentIds = students.map((s) => s.id);

  const events = await prisma.scanEvent.findMany({
    where: { studentId: { in: studentIds } },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { app: true, student: true },
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekEvents = await prisma.scanEvent.findMany({
    where: { studentId: { in: studentIds }, createdAt: { gte: weekStart } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (const e of weekEvents) {
    const key = e.createdAt.toDateString();
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const weekData = Array.from({ length: 7 }, (_, idx) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - idx));
    return {
      label: formatWeekday(day),
      value: buckets.get(day.toDateString()) ?? 0,
    };
  });

  return (
    <div className="px-6 py-8">
      <h1 className="text-xl font-semibold text-app-text mb-1">Activity</h1>
      <p className="text-sm text-app-muted mb-6">Recent AI interactions across all monitored apps.</p>

      <div className="app-card rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-app-text mb-4">This week</h2>
        <WeekBars data={weekData} color="#2dd4bf" />
      </div>

      <div className="app-card rounded-xl overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="text-left text-xs text-app-muted border-b border-app-border">
              <th className="px-5 py-2 font-medium">Time</th>
              <th className="px-5 py-2 font-medium">Child</th>
              <th className="px-5 py-2 font-medium">App</th>
              <th className="px-5 py-2 font-medium">Interaction</th>
              <th className="px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-app-border last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 text-app-muted text-xs font-mono whitespace-nowrap">
                  {formatDateTime(e.createdAt)}
                </td>
                <td className="px-5 py-3 text-app-text whitespace-nowrap">{e.student?.name}</td>
                <td className="px-5 py-3 text-app-muted whitespace-nowrap">{e.app.name}</td>
                <td className="px-5 py-3 text-app-muted max-w-sm truncate">&quot;{e.queryText}&quot;</td>
                <td className="px-5 py-3">
                  <RiskBadge level={e.riskLevel} />
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-app-muted text-sm">
                  No activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
