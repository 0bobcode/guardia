import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { RiskBadge, ActionLabel } from "@/components/RiskBadge";
import { Sparkline } from "@/components/charts/Sparkline";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { RiskBreakdownBars } from "@/components/charts/RiskBreakdownBars";
import { formatDate, formatLongDate, formatTime24 } from "@/lib/format";
import { weightedRiskScore } from "@/lib/risk";
import { AskGuardia } from "@/components/AskGuardia";
import { askGuardiaForDistrict } from "./askActions";

function pctChange(today: number, yesterday: number) {
  if (!yesterday) return null;
  return ((today - yesterday) / yesterday) * 100;
}

export default async function GuardRailDashboard() {
  const session = await requireRole("DISTRICT_ADMIN");
  const districtId = session.user.districtId!;

  const district = await prisma.district.findUnique({ where: { id: districtId } });

  const statsDesc = await prisma.dailyStat.findMany({
    where: { districtId },
    orderBy: { date: "desc" },
    take: 14,
  });
  const [today, yesterday] = statsDesc;
  const statsAsc = [...statsDesc].reverse();

  const callsChange = today && yesterday ? pctChange(today.apiCallsTotal, yesterday.apiCallsTotal) : null;

  const blockedLastHour = await prisma.scanEvent.count({
    where: {
      districtId,
      action: "BLOCKED",
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });

  const recentAlerts = await prisma.scanEvent.findMany({
    where: { districtId, riskLevel: { not: "NONE" } },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { app: true },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaysRiskGroups = await prisma.scanEvent.groupBy({
    by: ["riskLevel"],
    where: { districtId, createdAt: { gte: startOfDay } },
    _count: true,
  });
  const riskCounts = Object.fromEntries(todaysRiskGroups.map((g) => [g.riskLevel, g._count])) as Record<string, number>;
  const riskScore = weightedRiskScore(riskCounts);

  const callsTrend = statsAsc.map((s) => ({ label: formatDate(s.date), value: s.apiCallsTotal }));
  const blockedTrend = statsAsc.map((s) => ({ label: formatDate(s.date), value: s.requestsBlocked }));
  const complianceTrend = statsAsc.map((s) => ({ label: formatDate(s.date), value: s.complianceScore }));

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-1 load-in">
        <h1 className="text-xl font-semibold text-app-text">{district?.name}</h1>
        <div className="flex items-center gap-2 text-xs text-app-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          Live · {formatLongDate(new Date())}
        </div>
      </div>
      <p className="text-sm text-app-muted mb-8 load-in">Compliance Monitoring</p>

      <div className="mb-8">
        <AskGuardia
          ask={askGuardiaForDistrict}
          placeholder="Ask about district-wide AI activity…"
          examples={[
            "Any spikes in policy violations this week?",
            "Which category is flagged most right now?",
            "How are we trending vs last week?",
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div
          className="app-card rounded-xl p-5 load-in transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 hover:border-app-border-strong"
          style={{ animationDelay: "60ms" }}
        >
          <p className="text-xs text-app-muted mb-1">API Calls Today</p>
          <p className="text-3xl font-bold text-app-text tabular-nums">
            {(today?.apiCallsTotal ?? 0).toLocaleString("en-US")}
          </p>
          {callsChange !== null && (
            <p className={`text-xs mt-1 ${callsChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {callsChange >= 0 ? "↑" : "↓"} {Math.abs(callsChange).toFixed(0)}% vs yesterday
            </p>
          )}
          {callsTrend.length > 1 && (
            <div className="mt-3">
              <Sparkline data={callsTrend} color="#2dd4bf" />
            </div>
          )}
        </div>
        <div
          className="app-card rounded-xl p-5 load-in transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 hover:border-app-border-strong"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-xs text-app-muted mb-1">Requests Blocked</p>
          <p className="text-3xl font-bold text-app-text tabular-nums">
            {(today?.requestsBlocked ?? 0).toLocaleString("en-US")}
          </p>
          <p className="text-xs mt-1 text-amber-400">↑ {blockedLastHour} in last hour</p>
          {blockedTrend.length > 1 && (
            <div className="mt-3">
              <Sparkline data={blockedTrend} color="#f87171" />
            </div>
          )}
        </div>
        <div
          className="app-card rounded-xl p-5 load-in transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 hover:border-app-border-strong"
          style={{ animationDelay: "180ms" }}
        >
          <p className="text-xs text-app-muted mb-1">Compliance Score</p>
          <p className="text-3xl font-bold text-app-text tabular-nums">
            {(today?.complianceScore ?? 0).toFixed(1)}%
          </p>
          <p className="text-xs mt-1 text-app-muted">SLA target: 99.5%</p>
          {complianceTrend.length > 1 && (
            <div className="mt-3">
              <Sparkline data={complianceTrend} color="#4ade80" />
            </div>
          )}
        </div>
      </div>

      <div
        className="app-card rounded-xl p-5 load-in mb-8 grid sm:grid-cols-[auto_1fr] gap-8 items-center"
        style={{ animationDelay: "220ms" }}
      >
        <div>
          <p className="text-xs text-app-muted mb-2 text-center sm:text-left">Today&apos;s Risk Score</p>
          <RiskGauge score={riskScore} size={180} />
        </div>
        <div className="w-full">
          <p className="text-xs text-app-muted mb-3">Scans by risk tier, today</p>
          <RiskBreakdownBars counts={riskCounts} />
        </div>
      </div>

      <div className="app-card rounded-xl load-in" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <h2 className="text-sm font-semibold text-app-text">Recent Alerts</h2>
          <a
            href="/guardrail/alerts"
            className="group text-xs font-medium text-app-teal hover:underline inline-flex items-center gap-1"
          >
            View all
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-app-muted border-b border-app-border">
                <th className="px-5 py-2 font-medium">Time</th>
                <th className="px-5 py-2 font-medium">App / Platform</th>
                <th className="px-5 py-2 font-medium">Query Preview</th>
                <th className="px-5 py-2 font-medium">Risk Level</th>
                <th className="px-5 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map((a, i) => (
                <tr
                  key={a.id}
                  className="border-b border-app-border last:border-0 hover:bg-white/5 transition-colors load-in"
                  style={{ animationDelay: `${280 + i * 40}ms` }}
                >
                  <td className="px-5 py-3 text-app-muted font-mono text-xs">
                    {formatTime24(a.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-app-text">{a.app.name}</td>
                  <td className="px-5 py-3 text-app-muted max-w-xs truncate">
                    &quot;{a.queryText}&quot;
                  </td>
                  <td className="px-5 py-3">
                    <RiskBadge level={a.riskLevel} />
                  </td>
                  <td className="px-5 py-3">
                    <ActionLabel action={a.action} />
                  </td>
                </tr>
              ))}
              {recentAlerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-app-muted text-sm">
                    No alerts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
