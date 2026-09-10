import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { RiskBadge, ActionLabel } from "@/components/RiskBadge";
import { formatDateTime } from "@/lib/format";
import type { RiskLevel } from "@prisma/client";

const RISK_FILTERS: { label: string; value: RiskLevel | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MED" },
  { label: "Low", value: "LOW" },
  { label: "None", value: "NONE" },
];

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ risk?: string; app?: string; student?: string; q?: string }>;
}) {
  const session = await requireRole("DISTRICT_ADMIN");
  const districtId = session!.user.districtId!;
  const params = await searchParams;
  const riskFilter = (params.risk ?? "ALL") as RiskLevel | "ALL";
  const query = (params.q ?? "").trim();

  const apps = await prisma.app.findMany({ where: { districtId }, orderBy: { name: "asc" } });
  const students = await prisma.student.findMany({ where: { districtId }, orderBy: { name: "asc" } });

  const events = await prisma.scanEvent.findMany({
    where: {
      districtId,
      ...(riskFilter !== "ALL" ? { riskLevel: riskFilter } : {}),
      ...(params.app ? { appId: params.app } : {}),
      ...(params.student ? { studentId: params.student } : {}),
      ...(query ? { queryText: { contains: query } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { app: true, student: true },
  });

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-semibold text-app-text mb-1">Alerts</h1>
      <p className="text-sm text-app-muted mb-6">Full content-scan audit log across all integrated apps.</p>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 app-card rounded-lg p-1">
          {RISK_FILTERS.map((f) => (
            <a
              key={f.value}
              href={`/guardrail/alerts?risk=${f.value}${params.app ? `&app=${params.app}` : ""}${params.student ? `&student=${params.student}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                riskFilter === f.value ? "bg-app-teal text-[#04211d]" : "text-app-muted hover:text-app-text"
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>
        <form action="/guardrail/alerts" className="flex items-center gap-2">
          {riskFilter !== "ALL" && <input type="hidden" name="risk" value={riskFilter} />}
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-app-muted"
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11.5 11.5L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search queries..."
              className="text-xs border border-app-border rounded-md pl-7 pr-2 py-1.5 text-app-text bg-app-surface-2 w-44 focus:outline-none focus:ring-2 focus:ring-app-teal"
            />
          </div>
          <select
            name="app"
            defaultValue={params.app ?? ""}
            className="text-xs border border-app-border rounded-md px-2 py-1.5 text-app-text bg-app-surface-2"
          >
            <option value="">All apps</option>
            {apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            name="student"
            defaultValue={params.student ?? ""}
            className="text-xs border border-app-border rounded-md px-2 py-1.5 text-app-text bg-app-surface-2"
          >
            <option value="">All students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-app-border text-app-text hover:bg-white/5 transition-colors"
          >
            Filter
          </button>
          {(params.app || params.student || query || riskFilter !== "ALL") && (
            <a
              href="/guardrail/alerts"
              className="text-xs font-medium text-app-muted hover:text-app-text px-2"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      <div className="app-card rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-xs text-app-muted border-b border-app-border">
              <th className="px-5 py-2 font-medium">Time</th>
              <th className="px-5 py-2 font-medium">App</th>
              <th className="px-5 py-2 font-medium">Student</th>
              <th className="px-5 py-2 font-medium">Grade Band</th>
              <th className="px-5 py-2 font-medium">Query</th>
              <th className="px-5 py-2 font-medium">Category</th>
              <th className="px-5 py-2 font-medium">Risk</th>
              <th className="px-5 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-app-border last:border-0 align-top hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 text-app-muted font-mono text-xs whitespace-nowrap">
                  {formatDateTime(e.createdAt)}
                </td>
                <td className="px-5 py-3 text-app-text whitespace-nowrap">{e.app.name}</td>
                <td className="px-5 py-3 text-app-muted whitespace-nowrap">{e.student?.name ?? "—"}</td>
                <td className="px-5 py-3 text-app-muted whitespace-nowrap">
                  {e.gradeBand.replace("_", "–").replace("G", "")}
                </td>
                <td className="px-5 py-3 text-app-muted max-w-xs">&quot;{e.queryText}&quot;</td>
                <td className="px-5 py-3 text-app-muted text-xs">{e.categories || "—"}</td>
                <td className="px-5 py-3">
                  <RiskBadge level={e.riskLevel} />
                </td>
                <td className="px-5 py-3">
                  <ActionLabel action={e.action} />
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-app-muted text-sm">
                  No events match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
