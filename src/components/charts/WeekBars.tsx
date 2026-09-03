type DayDatum = { label: string; value: number };

/** Small column chart: interactions per day over the last week. */
export function WeekBars({ data, color }: { data: DayDatum[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2">
      {data.map((d) => {
        const pct = Math.max((d.value / max) * 100, 6);
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full h-20 flex items-end">
              <div
                className="w-full rounded-t-sm transition-[height] duration-500"
                style={{ height: `${pct}%`, background: color }}
                title={`${d.label}: ${d.value} interaction${d.value === 1 ? "" : "s"}`}
              />
            </div>
            <span className="text-[10px] text-app-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
