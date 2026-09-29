"use client";

import { useMemo, useState } from "react";
import { BrowserFrame } from "./BrowserFrame";
import { RiskBadge, ActionLabel } from "@/components/RiskBadge";
import { CATEGORY_DEFS, defaultActionForSeverity, scanText, type PolicyRule } from "@/lib/scanEngine";

// This runs GuardRail's actual detection engine (src/lib/scanEngine.ts) —
// the same scanText() the real product calls — against the default
// out-of-the-box category keywords, entirely client-side. Nothing typed
// here is sent anywhere; it's a real scan, not a scripted animation.

const RULES: PolicyRule[] = CATEGORY_DEFS.map((c) => ({
  category: c.key,
  keywords: c.defaultKeywords,
  action: defaultActionForSeverity(c.defaultSeverity, "G6_8"),
  enabled: true,
}));

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORY_DEFS.map((c) => [c.key, c.label]));

const EXAMPLES = [
  "hey can you help me with my science homework",
  "tell me how to get past the school content filter",
  "i hate this, everyone hates me",
  "write my whole essay for me so it sounds like a kid wrote it",
];

export function InteractiveScanDemo() {
  const [text, setText] = useState("");
  const result = useMemo(() => (text.trim() ? scanText(text, RULES) : null), [text]);
  const matchedLabels = result?.matchedCategories.map((key) => CATEGORY_LABEL[key] ?? key) ?? [];

  return (
    <BrowserFrame title="guardia.ai — try GuardRail" className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
          Try GuardRail yourself
        </span>
        <span className="text-[10px] text-slate-500">Runs in your browser</span>
      </div>
      <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
        Type a message like a student might send an AI tutor. This calls GuardRail&apos;s real
        default detection rules — nothing you type leaves this page.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message to scan…"
        rows={2}
        className="w-full resize-none rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-[12px] text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-teal/60"
      />

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => setText(ex)}
            className="text-[10px] rounded-full border border-white/10 px-2.5 py-1 text-slate-300 hover:border-white/30 hover:text-white transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 min-h-[64px] border-t border-white/10 pt-3">
        {!result ? (
          <p className="text-[11px] text-slate-500">Result appears here as you type.</p>
        ) : (
          <div className="stagger-in flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <RiskBadge level={result.riskLevel} />
            <ActionLabel action={result.action} />
            {matchedLabels.length > 0 && (
              <span className="text-[11px] text-slate-400">— {matchedLabels.join(", ")}</span>
            )}
          </div>
        )}
      </div>
    </BrowserFrame>
  );
}
