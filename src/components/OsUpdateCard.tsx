"use client";

import { useEffect, useRef, useState } from "react";

// A macOS Software Update-style control: no free-text field, just an
// "Install Update" button that runs a real install (the server action sets
// the version in the database, capped at whatever the district admin has
// published from GuardRail) behind a brief, honest progress animation
// instead of the change just snapping instantly. Once the parent is at the
// district's latest approved version, this shows "up to date" instead.

export function OsUpdateCard({
  currentVersion,
  latestVersion,
  upToDate,
  installAction,
}: {
  currentVersion: string;
  latestVersion: string;
  upToDate: boolean;
  installAction: () => Promise<void>;
}) {
  const [phase, setPhase] = useState<"idle" | "installing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (phase !== "installing" || startedRef.current) return;
    startedRef.current = true;
    const start = Date.now();
    const DURATION = 1800;
    const tick = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / DURATION) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        installAction().then(() => setPhase("done"));
      }
    }, 40);
    return () => clearInterval(tick);
  }, [phase, installAction]);

  return (
    <div className="app-card rounded-xl p-5 mb-6">
      <h2 className="text-sm font-semibold text-app-text mb-1">Platform</h2>
      <p className="text-xs text-app-muted mb-3">You&apos;re on Guardia OS {currentVersion}.</p>

      {phase === "idle" && upToDate && (
        <div className="flex items-center gap-2 border border-app-border rounded-md px-3 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <p className="text-sm text-app-text font-medium">You&apos;re up to date.</p>
        </div>
      )}

      {phase === "idle" && !upToDate && (
        <div className="flex items-center justify-between border border-app-border rounded-md px-3 py-2.5">
          <div>
            <p className="text-sm text-app-text font-medium">Guardia OS {latestVersion} available</p>
            <p className="text-xs text-app-faint">Approved by your district — safety and performance improvements</p>
          </div>
          <button
            onClick={() => setPhase("installing")}
            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-app-teal text-[#04211d] hover:opacity-90 transition-all shrink-0"
          >
            Install Update
          </button>
        </div>
      )}

      {phase === "installing" && (
        <div className="border border-app-border rounded-md px-3 py-2.5">
          <p className="text-sm text-app-text font-medium mb-2">Installing Guardia OS {latestVersion}…</p>
          <div className="h-1.5 rounded-full bg-app-surface-2 overflow-hidden">
            <div
              className="h-full bg-app-teal transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 rounded-md px-3 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <p className="text-sm text-emerald-300 font-medium">
            Guardia OS {latestVersion} installed — you&apos;re up to date.
          </p>
        </div>
      )}
    </div>
  );
}
