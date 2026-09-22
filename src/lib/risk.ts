const RISK_WEIGHT: Record<string, number> = { HIGH: 100, MED: 60, LOW: 25, NONE: 0 };

/** Volume-weighted average risk score (0-100) across a tier -> count map. */
export function weightedRiskScore(counts: Partial<Record<string, number>>) {
  const total = Object.values(counts).reduce((sum, c) => sum + (c ?? 0), 0);
  if (!total) return 0;
  const weighted = Object.entries(counts).reduce((sum, [level, c]) => sum + (RISK_WEIGHT[level] ?? 0) * (c ?? 0), 0);
  return weighted / total;
}

export function countByRiskLevel(events: { riskLevel: string }[]) {
  return events.reduce<Record<string, number>>((acc, e) => {
    acc[e.riskLevel] = (acc[e.riskLevel] ?? 0) + 1;
    return acc;
  }, {});
}
