import { prisma } from "@/lib/db";
import { StatCard, EmptyStateCard } from "@/components/internal/StatCard";
import { CATEGORY_DEFS } from "@/lib/scanEngine";

export default async function DeveloperDashboardPage() {
  const [scanEvents, apps, latestByDistrict] = await Promise.all([
    prisma.scanEvent.findMany({ select: { categories: true, action: true, createdAt: true } }),
    prisma.app.count(),
    prisma.district.groupBy({ by: ["osVersion"], _count: { osVersion: true } }),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const ev of scanEvents) {
    for (const cat of ev.categories.split(",").map((c) => c.trim()).filter(Boolean)) {
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }
  }
  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, count]) => ({ label: CATEGORY_DEFS.find((c) => c.key === key)?.label ?? key, count }));

  const blockedCount = scanEvents.filter((e) => e.action === "BLOCKED").length;
  const blockRate = scanEvents.length > 0 ? ((blockedCount / scanEvents.length) * 100).toFixed(1) : "0.0";

  // Server Component: this renders fresh per request, so reading the clock here is fine —
  // the purity rule is aimed at client re-renders, not a one-shot server render.
  // eslint-disable-next-line react-hooks/purity
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const last24h = scanEvents.filter((e) => e.createdAt.getTime() > cutoff).length;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-1">Developer</p>
        <h1 className="text-2xl font-bold">GuardRail engine &amp; integration health.</h1>
        <p className="text-sm text-slate-400 mt-1">Pulled from real scan events — {CATEGORY_DEFS.length} detection categories shipped.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Connected apps" value={apps} hint="Registered via the /api/scan integration" />
        <StatCard label="Scans, last 24h" value={last24h} />
        <StatCard label="Block rate, all-time" value={`${blockRate}%`} />
        <StatCard label="Detection categories" value={CATEGORY_DEFS.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-semibold mb-4">Most-matched categories</h2>
          {topCategories.length > 0 ? (
            <div className="space-y-2">
              {topCategories.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{c.label}</span>
                  <span className="tabular-nums text-white font-medium">{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyStateCard title="No matches yet" body="Categories will populate here once districts start sending scan traffic." />
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-semibold mb-4">Guardia OS rollout, by district</h2>
          {latestByDistrict.length > 0 ? (
            <div className="space-y-2">
              {latestByDistrict.map((v) => (
                <div key={v.osVersion} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono">OS {v.osVersion}</span>
                  <span className="tabular-nums text-white font-medium">{v._count.osVersion} district(s)</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyStateCard title="No districts yet" body="OS version adoption will show up here." />
          )}
        </div>
      </div>

      <EmptyStateCard
        title="No error/latency monitoring connected"
        body="This dashboard reads directly from Postgres. Request latency, error rate, and uptime need an APM (e.g. Sentry, Datadog) wired into the /api/scan route — not built yet."
      />
    </div>
  );
}
