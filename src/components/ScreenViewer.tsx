"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Status = "REQUESTED" | "ACTIVE" | "ENDED" | "DECLINED" | "EXPIRED";
type Info = {
  status: Status;
  endedBy: string | null;
  frameCount: number;
  respondedAt: string | null;
  requestExpiresInSec: number;
  studentName: string;
};

const ENDED_TEXT: Record<string, string> = {
  PARENT: "You ended this view.",
  CHILD: "Ended from their device.",
  TIMEOUT: "Ended automatically (15-minute limit, or the device went offline).",
};

export function ScreenViewer({ id, studentName, stopAction }: { id: string; studentName: string; stopAction: (fd: FormData) => Promise<void> }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [frameN, setFrameN] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const done = useRef(false);

  useEffect(() => {
    let stopped = false;
    async function poll() {
      if (stopped || done.current) return;
      try {
        const res = await fetch(`/api/screen/${id}`, { cache: "no-store" });
        if (res.ok && !stopped) {
          const data: Info = await res.json();
          setInfo(data);
          setFrameN(data.frameCount);
          if (data.status !== "REQUESTED" && data.status !== "ACTIVE") done.current = true;
        }
      } catch {
        // transient — try again next tick
      }
    }
    poll();
    const t = setInterval(poll, 1000);
    const c = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      stopped = true;
      clearInterval(t);
      clearInterval(c);
    };
  }, [id]);

  const status = info?.status;
  const name = info?.studentName ?? studentName;
  const elapsed = info?.respondedAt ? Math.max(0, Math.round((now - new Date(info.respondedAt).getTime()) / 1000)) : 0;

  return (
    <div className="space-y-4">
      {(!status || status === "REQUESTED") && (
        <div className="app-card rounded-xl p-6 text-center">
          <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-app-teal border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-app-text">Waiting for {name} to allow it…</p>
          <p className="text-xs text-app-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
            A request has been sent to their device. They have to tap Allow before anything is shared, and they can say no.
            {info ? ` The request expires in ${Math.floor(info.requestExpiresInSec / 60)}:${String(info.requestExpiresInSec % 60).padStart(2, "0")}.` : ""}
          </p>
        </div>
      )}

      {status === "ACTIVE" && (
        <div className="app-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-app-border">
            <span className="flex items-center gap-2 text-xs font-semibold text-app-text">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              Live · {name} allowed this · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-app-faint">About 1 picture per second · some are saved for later</span>
          </div>
          <div className="bg-black flex items-center justify-center min-h-[240px]">
            {frameN > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/screen/${id}/frame?n=${frameN}`} alt={`${name}'s screen`} className="max-h-[70vh] w-auto" />
            ) : (
              <p className="text-xs text-slate-500 p-8">Waiting for the first picture…</p>
            )}
          </div>
        </div>
      )}

      {status === "DECLINED" && (
        <div className="app-card rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-app-text">{name} said no.</p>
          <p className="text-xs text-app-muted mt-1.5">Nothing was shared. You can talk to them and ask again later.</p>
        </div>
      )}
      {status === "EXPIRED" && (
        <div className="app-card rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-app-text">No answer.</p>
          <p className="text-xs text-app-muted mt-1.5">The request expired. Their device may be off or offline. Nothing was shared.</p>
        </div>
      )}
      {status === "ENDED" && (
        <div className="app-card rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-app-text">This screen view has ended.</p>
          <p className="text-xs text-app-muted mt-1.5">{ENDED_TEXT[info?.endedBy ?? ""] ?? ""}</p>
          <Link href={`/trusted/screen/${id}/photos`} className="mt-3 inline-block text-xs font-semibold text-app-teal hover:underline">
            View saved photos →
          </Link>
        </div>
      )}

      {(!status || status === "REQUESTED" || status === "ACTIVE") && (
        <form action={stopAction}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-xs font-semibold px-4 py-2 rounded-md border border-app-border text-app-text hover:border-red-400 hover:text-red-300 transition-colors">
            {status === "ACTIVE" ? "Stop viewing" : "Cancel request"}
          </button>
        </form>
      )}
    </div>
  );
}
