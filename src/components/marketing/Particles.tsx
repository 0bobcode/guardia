const COLORS = ["#2dd4bf", "#818cf8", "#2dd4bf", "#f59e0b", "#818cf8"];

/** A handful of small dots drifting slowly upward — pure CSS, no JS loop.
 *  Deterministic layout (no Math.random) so server and client render the
 *  same markup and there's no hydration mismatch. */
export function Particles({ count = 8 }: { count?: number }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const left = ((i * 37 + 11) % 100).toFixed(1);
    const duration = 2.8 + ((i * 3) % 4);
    const delay = (i * 0.7) % 5;
    const size = 2 + (i % 3);
    const color = COLORS[i % COLORS.length];
    return { left, duration, delay, size, color, key: i };
  });

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.key}
          className="particle-dot absolute rounded-full"
          style={{
            left: `${d.left}%`,
            bottom: "-10px",
            width: d.size,
            height: d.size,
            background: d.color,
            boxShadow: `0 0 6px ${d.color}`,
            ["--pd" as string]: `${d.duration}s`,
            ["--pt" as string]: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
