import { prisma } from "@/lib/db";
import { StatCard } from "@/components/internal/StatCard";
import { RiskBadge } from "@/components/RiskBadge";

export default async function SuperAdminPage() {
  const [districtCount, userCount, studentCount, scanCount, districts, riskCounts, recentScans] =
    await Promise.all([
      prisma.district.count(),
      prisma.user.count(),
      prisma.student.count(),
      prisma.scanEvent.count(),
      prisma.district.findMany({
        select: {
          id: true,
          name: true,
          osVersion: true,
          createdAt: true,
          _count: { select: { users: true, students: true, scanEvents: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.scanEvent.groupBy({ by: ["riskLevel"], _count: { riskLevel: true } }),
      prisma.scanEvent.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { id: true, queryText: true, riskLevel: true, action: true, createdAt: true, district: { select: { name: true } } },
      }),
    ]);

  const riskMap: Record<string, number> = Object.fromEntries(
    riskCounts.map((r) => [r.riskLevel, r._count.riskLevel])
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-1">Super Admin</p>
        <h1 className="text-2xl font-bold">Everything, across every district.</h1>
        <p className="text-sm text-slate-400 mt-1">Live from the production database — not a mockup.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Districts" value={districtCount} />
        <StatCard label="Users (all roles)" value={userCount} />
        <StatCard label="Students" value={studentCount} />
        <StatCard label="Scan events" value={scanCount} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-semibold mb-4">Risk breakdown, all-time</h2>
          <div className="space-y-2">
            {(["HIGH", "MED", "LOW", "NONE"] as const).map((level) => (
              <div key={level} className="flex items-center justify-between text-sm">
                <RiskBadge level={level} />
                <span className="tabular-nums text-slate-300">{riskMap[level] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-semibold mb-4">Districts</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {districts.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0">
                <div>
                  <p className="text-white font-medium">{d.name}</p>
                  <p className="text-slate-500">OS {d.osVersion} · since {d.createdAt.toISOString().slice(0, 10)}</p>
                </div>
                <div className="text-right text-slate-400">
                  <p>{d._count.users} staff · {d._count.students} students</p>
                  <p>{d._count.scanEvents} scans</p>
                </div>
              </div>
            ))}
            {districts.length === 0 && <p className="text-xs text-slate-500">No districts yet.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-sm font-semibold mb-4">Most recent scan events, any district</h2>
        <div className="space-y-1.5">
          {recentScans.map((s) => (
            <div key={s.id} className="grid grid-cols-[100px_1fr_auto_auto] items-center gap-3 text-xs py-1.5 border-b border-white/5 last:border-0">
              <span className="text-slate-500">{s.district.name}</span>
              <span className="text-slate-300 truncate">{s.queryText}</span>
              <RiskBadge level={s.riskLevel} />
              <span className="text-slate-500 font-mono">{s.createdAt.toISOString().slice(11, 19)}</span>
            </div>
          ))}
          {recentScans.length === 0 && <p className="text-xs text-slate-500">No scan events yet.</p>}
        </div>
      </div>
    </div>
  );
}
