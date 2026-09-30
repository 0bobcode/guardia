import { prisma } from "@/lib/db";
import { StatCard } from "@/components/internal/StatCard";

function thirdFridayOf(year: number, month: number): Date {
  const d = new Date(year, month, 1);
  let fridaysSeen = 0;
  while (true) {
    if (d.getDay() === 5) {
      fridaysSeen++;
      if (fridaysSeen === 3) return new Date(d);
    }
    d.setDate(d.getDate() + 1);
  }
}

function nextTownhall(): Date {
  const now = new Date();
  const thisMonth = thirdFridayOf(now.getFullYear(), now.getMonth());
  if (thisMonth.getTime() >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
    return thisMonth;
  }
  return thirdFridayOf(now.getFullYear(), now.getMonth() + 1);
}

export default async function PresenterDashboardPage() {
  const [districtCount, studentCount, scanCount, recentDistricts] = await Promise.all([
    prisma.district.count(),
    prisma.student.count(),
    prisma.scanEvent.count(),
    prisma.district.findMany({
      select: { name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const townhall = nextTownhall();
  // eslint-disable-next-line react-hooks/purity -- Server Component, renders fresh per request
  const daysAway = Math.ceil((townhall.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-1">Presenter</p>
        <h1 className="text-2xl font-bold">Townhall prep.</h1>
        <p className="text-sm text-slate-400 mt-1">Townhalls run the third Friday of every month.</p>
      </div>

      <div className="rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold text-brand-teal uppercase">Next townhall</p>
          <p className="text-xl font-bold text-white mt-1">
            {townhall.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <p className="text-3xl font-bold text-brand-teal tabular-nums">{daysAway}d</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-4">Headline slide numbers</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Districts onboard" value={districtCount} />
          <StatCard label="Students protected" value={studentCount} />
          <StatCard label="Total scans processed" value={scanCount} />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-sm font-semibold mb-4">What&apos;s new since last month</h2>
        <p className="text-xs text-slate-500 mb-3">Newest districts onboarded — a good source of &ldquo;since last townhall&rdquo; wins.</p>
        <div className="space-y-2">
          {recentDistricts.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0">
              <span className="text-slate-300">{d.name}</span>
              <span className="text-slate-500">{d.createdAt.toISOString().slice(0, 10)}</span>
            </div>
          ))}
          {recentDistricts.length === 0 && <p className="text-xs text-slate-500">No districts yet.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-sm font-semibold mb-3">Suggested agenda</h2>
        <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
          <li>Headline numbers (above)</li>
          <li>New districts / integrations this month</li>
          <li>Notable GuardRail catches (pull 1-2 from Super Admin → recent scan events)</li>
          <li>Product roadmap — link the <a href="/changelog" className="text-brand-teal hover:underline">changelog</a></li>
          <li>Open floor / Q&amp;A</li>
        </ol>
      </div>
    </div>
  );
}
