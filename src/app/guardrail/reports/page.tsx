import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { HBarChart } from "@/components/charts/HBarChart";

const STATE_FRAMEWORKS = [
  { state: "Ohio", statute: "H.B. 96 — AI Child Safety Framework", status: "Enforced" },
  { state: "Texas", statute: "SB 1188 — Student AI Interaction Standards", status: "Enforced" },
  { state: "California", statute: "AB 3211 (pending)", status: "Pending" },
  { state: "New York", statute: "AI in Ed Act (pending)", status: "Pending" },
];

export default async function ReportsPage() {
  const session = await requireRole("DISTRICT_ADMIN");
  const districtId = session!.user.districtId!;

  const [total, blocked, flagged, byCategory, byApp] = await Promise.all([
    prisma.scanEvent.count({ where: { districtId } }),
    prisma.scanEvent.count({ where: { districtId, action: "BLOCKED" } }),
    prisma.scanEvent.count({ where: { districtId, action: "FLAGGED" } }),
    prisma.scanEvent.groupBy({
      by: ["categories"],
      where: { districtId, categories: { not: "" } },
      _count: { _all: true },
    }),
    prisma.scanEvent.groupBy({
      by: ["appId"],
      where: { districtId },
      _count: { _all: true },
    }),
  ]);

  const apps = await prisma.app.findMany({ where: { districtId } });
  const appName = (id: string) => apps.find((a) => a.id === id)?.name ?? id;

  const categoryTotals = new Map<string, number>();
  for (const row of byCategory) {
    for (const cat of row.categories.split(",").map((c) => c.trim()).filter(Boolean)) {
      categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + row._count._all);
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-app-text">Compliance Reports</h1>
        <a
          href="/api/reports/export"
          className="text-xs font-medium px-3 py-2 rounded-md bg-app-teal text-[#04211d] hover:opacity-90"
        >
          Export audit log (CSV)
        </a>
      </div>
      <p className="text-sm text-app-muted mb-8">
        Auto-generated audit trails formatted for state child-safety regulations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="app-card rounded-xl p-5 transition-shadow hover:border-app-border-strong">
          <p className="text-xs text-app-muted mb-1">Total Scanned Interactions</p>
          <p className="text-2xl font-bold text-app-text tabular-nums">{total.toLocaleString("en-US")}</p>
        </div>
        <div className="app-card rounded-xl p-5 transition-shadow hover:border-app-border-strong">
          <p className="text-xs text-app-muted mb-1">Blocked (High Risk)</p>
          <p className="text-2xl font-bold text-red-400 tabular-nums">{blocked.toLocaleString("en-US")}</p>
        </div>
        <div className="app-card rounded-xl p-5 transition-shadow hover:border-app-border-strong">
          <p className="text-xs text-app-muted mb-1">Flagged for Review</p>
          <p className="text-2xl font-bold text-amber-400 tabular-nums">{flagged.toLocaleString("en-US")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="app-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-app-text mb-4">Incidents by Category</h2>
          {categoryTotals.size > 0 ? (
            <HBarChart
              color="#f87171"
              data={[...categoryTotals.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([label, value]) => ({ label, value }))}
            />
          ) : (
            <p className="text-sm text-app-muted">No flagged categories yet.</p>
          )}
        </div>
        <div className="app-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-app-text mb-4">Volume by App</h2>
          <HBarChart
            color="#2dd4bf"
            data={byApp
              .sort((a, b) => b._count._all - a._count._all)
              .map((row) => ({ label: appName(row.appId), value: row._count._all }))}
          />
        </div>
      </div>

      <div className="app-card rounded-xl">
        <div className="px-5 py-4 border-b border-app-border">
          <h2 className="text-sm font-semibold text-app-text">State Regulatory Frameworks</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-app-muted border-b border-app-border">
              <th className="px-5 py-2 font-medium">State</th>
              <th className="px-5 py-2 font-medium">Statute</th>
              <th className="px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {STATE_FRAMEWORKS.map((f) => (
              <tr key={f.state} className="border-b border-app-border last:border-0">
                <td className="px-5 py-3 text-app-text font-medium">{f.state}</td>
                <td className="px-5 py-3 text-app-muted">{f.statute}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      f.status === "Enforced"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-slate-400 bg-white/8"
                    }`}
                  >
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
