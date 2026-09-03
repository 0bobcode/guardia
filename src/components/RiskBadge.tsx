const LABEL: Record<string, string> = {
  HIGH: "HIGH",
  MED: "MED",
  LOW: "LOW",
  NONE: "NONE",
};

export function RiskBadge({ level }: { level: string }) {
  return <span className={`risk-badge risk-${level}`}>{LABEL[level] ?? level}</span>;
}

const ACTION_STYLES: Record<string, string> = {
  BLOCKED: "text-red-400",
  FLAGGED: "text-amber-400",
  PASSED: "text-emerald-400",
};

export function ActionLabel({ action }: { action: string }) {
  return (
    <span className={`text-xs font-semibold ${ACTION_STYLES[action] ?? ""}`}>
      {action.charAt(0) + action.slice(1).toLowerCase()}
    </span>
  );
}
