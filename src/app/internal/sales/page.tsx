import { prisma } from "@/lib/db";
import { StatCard, EmptyStateCard } from "@/components/internal/StatCard";

export default async function SalesDashboardPage() {
  const districts = await prisma.district.findMany({
    select: { name: true, createdAt: true, _count: { select: { users: true, students: true } } },
    orderBy: { createdAt: "desc" },
  });

  const requests = await prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 25 });

  const now = new Date();
  const thisMonth = districts.filter(
    (d) => d.createdAt.getFullYear() === now.getFullYear() && d.createdAt.getMonth() === now.getMonth()
  ).length;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-1">Sales</p>
        <h1 className="text-2xl font-bold">Pipeline &amp; accounts.</h1>
        <p className="text-sm text-slate-400 mt-1">
          Guardia has no CRM connected yet — the numbers below are real signed districts, not deals in flight.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Signed districts" value={districts.length} hint="Real, from production" />
        <StatCard label="New this month" value={thisMonth} />
        <StatCard
          label="Avg. students / district"
          value={districts.length > 0 ? Math.round(districts.reduce((s, d) => s + d._count.students, 0) / districts.length) : 0}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-sm font-semibold mb-4">Signed accounts</h2>
        <div className="space-y-2">
          {districts.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0">
              <span className="text-slate-300">{d.name}</span>
              <span className="text-slate-500">{d._count.users} staff · {d._count.students} students</span>
              <span className="text-slate-500">signed {d.createdAt.toISOString().slice(0, 10)}</span>
            </div>
          ))}
          {districts.length === 0 && <p className="text-xs text-slate-500">No signed districts yet.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-sm font-semibold mb-1">Contact requests</h2>
        <p className="text-xs text-slate-500 mb-4">
          From the site&apos;s contact form, newest first. &ldquo;Orb claim&rdquo; marks people who clicked a landing-page orb.
        </p>
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="text-white font-medium">{r.name}</span>
                <span className="text-slate-400">{r.email}</span>
                {r.organization && <span className="text-slate-500">{r.organization}</span>}
                <span
                  className={
                    r.interest === "Orb claim"
                      ? "rounded-full bg-brand-teal/20 px-2 py-0.5 font-semibold text-brand-teal"
                      : "rounded-full bg-white/10 px-2 py-0.5 text-slate-300"
                  }
                >
                  {r.interest}
                </span>
                <span className="ml-auto text-slate-500">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{r.message}</p>
            </div>
          ))}
          {requests.length === 0 && <p className="text-xs text-slate-500">No contact requests yet.</p>}
        </div>
      </div>

      <EmptyStateCard
        title="No pipeline / lead data connected"
        body="Open opportunities, deal stages, and forecasted ARR need a CRM (e.g. HubSpot, Salesforce) wired in — nothing here is invented to fill that gap. Track leads there until that integration exists."
      />
    </div>
  );
}
