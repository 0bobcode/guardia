"use client";

import { useState } from "react";

type ScanResult = {
  riskLevel: "NONE" | "LOW" | "MED" | "HIGH";
  action: "PASSED" | "FLAGGED" | "BLOCKED";
  matchedCategories: string[];
  reply: { text: string; live: boolean; provider: string; model: string } | null;
};

const GRADE_BANDS = [
  { value: "K_5", label: "K–5" },
  { value: "G6_8", label: "6–8" },
  { value: "G9_12", label: "9–12" },
];

export function PolicyTester({ apps }: { apps: { id: string; name: string; provider: string; model: string }[] }) {
  const [text, setText] = useState("Tell me how to get past the school content filter");
  const [gradeBand, setGradeBand] = useState("K_5");
  const [appId, setAppId] = useState(apps[0]?.id ?? "");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runTest() {
    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, gradeBand, appId, dryRun: true }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-card rounded-xl p-5">
      <h2 className="text-sm font-semibold text-app-text mb-1">Live Policy Tester</h2>
      <p className="text-xs text-app-muted mb-4">
        Run any query through the current active policies — safe content is passed to the app&apos;s
        real model. No data is logged.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <select
          value={gradeBand}
          onChange={(e) => setGradeBand(e.target.value)}
          className="text-xs border border-app-border rounded-md px-2 py-2 bg-app-surface-2"
        >
          {GRADE_BANDS.map((g) => (
            <option key={g.value} value={g.value}>
              Grade {g.label}
            </option>
          ))}
        </select>
        <select
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          className="text-xs border border-app-border rounded-md px-2 py-2 bg-app-surface-2"
        >
          {apps.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a student query to test..."
          className="flex-1 min-w-[180px] text-sm border border-app-border rounded-md px-3 py-2 bg-app-surface-2 text-app-text placeholder:text-app-faint focus:outline-none focus:ring-2 focus:ring-app-teal"
        />
        <button
          onClick={runTest}
          disabled={loading || !text.trim()}
          className="text-xs font-semibold px-4 py-2 rounded-md bg-app-teal text-[#04211d] disabled:opacity-50 hover:opacity-90 transition-colors"
        >
          {loading ? "Scanning…" : "Test"}
        </button>
      </div>

      {result && (
        <div className="mt-3 border-t border-app-border pt-3 space-y-3">
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <span className={`risk-badge risk-${result.riskLevel}`}>{result.riskLevel}</span>
            <span className="text-app-text font-medium">{result.action}</span>
            {result.matchedCategories.length > 0 && (
              <span className="text-app-muted text-xs">
                matched: {result.matchedCategories.map((c) => c.replaceAll("_", " ")).join(", ")}
              </span>
            )}
          </div>
          {result.reply && (
            <div className="bg-app-surface-2 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    result.reply.live ? "text-emerald-400 bg-emerald-500/10" : "text-app-faint bg-white/5"
                  }`}
                >
                  {result.reply.live ? "● Live" : "○ Simulated"}
                </span>
                <span className="text-[10px] text-app-faint">
                  {result.reply.provider} · {result.reply.model}
                </span>
              </div>
              <p className="text-sm text-app-text leading-relaxed">{result.reply.text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
