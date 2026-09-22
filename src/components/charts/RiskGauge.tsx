const BANDS = [
  { from: 0, to: 40, color: "var(--app-risk-none)" },
  { from: 40, to: 75, color: "var(--app-risk-med)" },
  { from: 75, to: 100, color: "var(--app-risk-high)" },
];

const TIERS = [
  { max: 40, label: "Low risk", color: "var(--app-risk-none)" },
  { max: 75, label: "Elevated", color: "var(--app-risk-med)" },
  { max: 101, label: "High risk", color: "var(--app-risk-high)" },
];

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, fromScore: number, toScore: number) {
  const a1 = 180 - (fromScore / 100) * 180;
  const a2 = 180 - (toScore / 100) * 180;
  const p1 = polar(cx, cy, r, a1);
  const p2 = polar(cx, cy, r, a2);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`;
}

/** Semicircular threshold gauge: fixed safe/elevated/high bands with a
 *  needle at the current score. Bands are a status encoding (fixed
 *  meaning), not a magnitude fill — the score number and tier label do
 *  the direct labeling so color is never the only signal. */
export function RiskGauge({ score, size = 200 }: { score: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18;
  const needleAngle = 180 - (clamped / 100) * 180;
  const needleTip = polar(cx, cy, r - 14, needleAngle);
  const tier = TIERS.find((t) => clamped <= t.max) ?? TIERS[TIERS.length - 1];

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        {BANDS.map((b) => (
          <path
            key={b.from}
            d={arcPath(cx, cy, r, b.from, b.to)}
            fill="none"
            stroke={b.color}
            strokeWidth={14}
            strokeLinecap={b.from === 0 || b.to === 100 ? "round" : "butt"}
            opacity={0.9}
          />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="var(--app-text)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill="var(--app-text)" />
      </svg>
      <p className="text-3xl font-bold text-app-text tabular-nums -mt-1">{Math.round(clamped)}</p>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: tier.color }}>
        {tier.label}
      </p>
    </div>
  );
}
