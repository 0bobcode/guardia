const TIER_META: Record<string, { label: string; color: string }> = {
  HIGH: { label: "High", color: "var(--app-risk-high)" },
  MED: { label: "Medium", color: "var(--app-risk-med)" },
  LOW: { label: "Low", color: "var(--app-risk-low)" },
  NONE: { label: "None", color: "var(--app-risk-none)" },
};

const ORDER = ["HIGH", "MED", "LOW", "NONE"];

/** One directly-labeled row per risk tier — status color plus text label,
 *  never color alone. Bar width is share of the total, not raw count, so
 *  rows stay comparable regardless of volume. */
export function RiskBreakdownBars({ counts }: { counts: Partial<Record<string, number>> }) {
  const total = ORDER.reduce((sum, k) => sum + (counts[k] ?? 0), 0);

  return (
    <div className="space-y-3">
      {ORDER.map((key) => {
        const meta = TIER_META[key];
        const count = counts[key] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="inline-flex items-center gap-1.5 text-app-muted">
                <span className="h-2 w-2 rounded-full inline-block" style={{ background: meta.color }} />
                {meta.label}
              </span>
              <span className="text-app-text font-medium tabular-nums">
                {count} · {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-app-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: meta.color }}
              />
            </div>
          </div>
        );
      })}
      {total === 0 && <p className="text-xs text-app-muted text-center py-2">No scans yet today.</p>}
    </div>
  );
}
