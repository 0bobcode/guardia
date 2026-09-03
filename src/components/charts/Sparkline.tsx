type Point = { label: string; value: number };

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

/**
 * Compact trend sparkline for a stat tile: single hue, thin line + soft area
 * wash, end-dot marker, native title tooltips per point (no JS needed).
 */
export function Sparkline({
  data,
  color,
  width = 168,
  height = 40,
}: {
  data: Point[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = 4;
  const padX = 3;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * innerW;
    const y = padY + innerH - ((d.value - min) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(2)},${height - padY} L${points[0].x.toFixed(2)},${height - padY} Z`;

  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="trend">
      <path d={areaPath} fill={color} fillOpacity={0.1} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={7} fill="transparent">
          <title>
            {p.label}: {formatCompact(p.value)}
          </title>
        </circle>
      ))}
      <circle cx={last.x} cy={last.y} r={4} fill={color} stroke="white" strokeWidth={2} />
    </svg>
  );
}
