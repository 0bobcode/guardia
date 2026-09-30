import { EmptyStateCard, StatCard } from "@/components/internal/StatCard";

const SITE_SECTIONS = [
  { page: "/", sections: 9, cta: "Try the interactive demo" },
  { page: "/products/guardrail", sections: 5, cta: "Sign in to the console" },
  { page: "/products/trusted", sections: 5, cta: "Sign in to your dashboard" },
  { page: "/changelog", sections: 1, cta: "—" },
];

export default function MarketingDashboardPage() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-1">Marketing</p>
        <h1 className="text-2xl font-bold">Site &amp; content overview.</h1>
        <p className="text-sm text-slate-400 mt-1">
          No analytics provider (GA4, PostHog, Plausible) is wired into this codebase yet — visits,
          conversion rate, and traffic sources aren&apos;t real numbers this dashboard can show honestly.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Public marketing pages" value={SITE_SECTIONS.length} />
        <StatCard label="Content sections, homepage" value={9} />
        <StatCard label="Live interactive demos" value={2} hint="GuardRail scan demo, on / and /products/guardrail" />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-sm font-semibold mb-4">Page inventory</h2>
        <div className="space-y-2">
          {SITE_SECTIONS.map((p) => (
            <div key={p.page} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0">
              <span className="text-slate-300 font-mono">{p.page}</span>
              <span className="text-slate-500">{p.sections} section(s)</span>
              <span className="text-slate-500">{p.cta}</span>
            </div>
          ))}
        </div>
      </div>

      <EmptyStateCard
        title="No analytics connected"
        body="Wire up GA4, PostHog, or Plausible to get real visits, funnel drop-off, and demo-completion rate here. Until then, this dashboard only tracks what's actually shipped on the site."
      />
    </div>
  );
}
