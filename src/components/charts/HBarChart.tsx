type BarDatum = { label: string; value: number };

/**
 * Horizontal magnitude-by-category bar chart. Single hue (color already
 * encodes nothing extra — position/length carries the value), rounded at
 * the value end, square at the baseline, value labeled at the tip.
 */
export function HBarChart({ data, color }: { data: BarDatum[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = Math.max((d.value / max) * 100, 3);
        return (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-36 shrink-0 text-xs text-app-muted truncate capitalize" title={d.label}>
              {d.label.replaceAll("_", " ")}
            </div>
            <div className="flex-1 h-4 rounded-sm bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-r-sm transition-[width] duration-500"
                style={{ width: `${pct}%`, background: color }}
                title={`${d.label.replaceAll("_", " ")}: ${d.value}`}
              />
            </div>
            <div className="w-8 shrink-0 text-xs font-semibold text-app-text tabular-nums text-right">
              {d.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
