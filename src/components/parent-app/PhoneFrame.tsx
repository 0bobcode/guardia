"use client";

import { useEffect, useState } from "react";
import type { OS } from "./DeviceShell";
import { playLockSound, playTapSound } from "@/lib/parent-app/sound";

// A CSS-only phone-shaped frame so the Guardia Parent app can be previewed
// in any ordinary browser tab — no simulator, no extra process, no wasted
// memory. The shape/status-bar/system-bar differ between the iOS and
// Android presets, and the home control, volume rocker, and power button
// are real, clickable controls (sized generously — a real mouse pointer,
// not a fingertip, has to land on them).

function StatusBar({ os }: { os: OS }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex items-center justify-between px-6 pt-3 pb-1 text-white text-[14px] font-semibold shrink-0">
      <span className="tabular-nums">{time ?? "9:41"}</span>
      {os === "ios" ? (
        <div className="absolute left-1/2 top-2 -translate-x-1/2 h-[30px] w-[110px] rounded-full bg-black" />
      ) : (
        <div className="absolute left-1/2 top-3 -translate-x-1/2 h-[11px] w-[11px] rounded-full bg-black" />
      )}
      <div className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.5" fill="white" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" fill="white" />
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill="white" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="white" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2.5C11 2.5 13.3 3.7 15 5.6l-1.4 1.4C12.2 5.4 10.2 4.5 8 4.5s-4.2.9-5.6 2.5L1 5.6C2.7 3.7 5 2.5 8 2.5Z" fill="white" />
          <path d="M8 6.5c1.5 0 2.9.6 3.9 1.7l-1.4 1.4C9.8 8.9 8.9 8.5 8 8.5s-1.8.4-2.5 1.1L4.1 8.2C5.1 7.1 6.5 6.5 8 6.5Z" fill="white" />
          <circle cx="8" cy="11" r="1.2" fill="white" />
        </svg>
        {os === "ios" ? (
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="white" strokeOpacity="0.5" />
            <rect x="2" y="2" width="18" height="8" rx="1.5" fill="white" />
            <rect x="22.5" y="4" width="1.5" height="4" rx="0.75" fill="white" fillOpacity="0.5" />
          </svg>
        ) : (
          <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
            <path d="M6.5 0 1 7h4l-1 5 6.5-8H6l1-4Z" fill="white" />
          </svg>
        )}
      </div>
    </div>
  );
}

function SystemBar({ os, onHome, onBack }: { os: OS; onHome: () => void; onBack: () => void }) {
  function tap(fn: () => void) {
    playTapSound();
    fn();
  }

  if (os === "ios") {
    return (
      <div className="shrink-0 flex justify-center bg-app-bg">
        <button onClick={() => tap(onHome)} aria-label="Home" className="group px-12 py-3.5 -mt-1.5">
          <span className="block h-[5px] w-[134px] rounded-full bg-white/90 group-hover:bg-white transition-colors" />
        </button>
      </div>
    );
  }
  return (
    <div className="shrink-0 flex items-center justify-around bg-app-bg">
      <button onClick={() => tap(onBack)} aria-label="Back" className="text-white/70 hover:text-white transition-colors p-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M9 2 3 8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button onClick={() => tap(onHome)} aria-label="Home" className="group p-4">
        <span className="block h-[14px] w-[14px] rounded-full border-2 border-white/80 group-hover:border-white transition-colors" />
      </button>
      <button onClick={() => tap(onHome)} aria-label="Recents" className="group p-4">
        <span className="block h-[13px] w-[13px] rounded-[3px] border-2 border-white/70 group-hover:border-white transition-colors" />
      </button>
    </div>
  );
}

function SideButton({
  side,
  top,
  visualHeight,
  onClick,
  label,
}: {
  side: "left" | "right";
  top: number;
  visualHeight: number;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`group absolute flex items-center justify-center ${side === "left" ? "-left-4" : "-right-4"}`}
      style={{ top: top - 8, width: 20, height: visualHeight + 16 }}
    >
      <span
        className={`block w-[3px] bg-[#1c1c1e] group-hover:bg-[#3a3a3f] transition-colors ${
          side === "left" ? "rounded-l" : "rounded-r"
        }`}
        style={{ height: visualHeight }}
      />
    </button>
  );
}

function VolumeHud({ level }: { level: number }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur rounded-2xl px-4 py-3 flex flex-col items-center gap-2 shadow-lg">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="white" />
        {level > 0 && <path d="M17 8.5a5 5 0 0 1 0 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" />}
      </svg>
      <div className="flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`h-4 w-1.5 rounded-full ${i < level ? "bg-white" : "bg-white/25"}`} />
        ))}
      </div>
    </div>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      onClick={onUnlock}
      className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 bg-black text-white w-full"
    >
      <p className="text-6xl font-semibold tabular-nums">
        {now ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "9:41"}
      </p>
      <p className="text-sm text-white/60">
        {now ? now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : ""}
      </p>
      <p className="text-xs text-white/40 mt-10">Tap to unlock</p>
    </button>
  );
}

export function PhoneFrame({
  os,
  onHome,
  onBack,
  children,
}: {
  os: OS;
  onHome: () => void;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const [locked, setLocked] = useState(false);
  const [volume, setVolume] = useState(6);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    if (!showVolume) return;
    const id = setTimeout(() => setShowVolume(false), 1500);
    return () => clearTimeout(id);
  }, [showVolume, volume]);

  function bumpVolume(delta: number) {
    setVolume((v) => Math.max(0, Math.min(10, v + delta)));
    setShowVolume(true);
  }

  const cornerOuter = os === "ios" ? "rounded-[55px]" : "rounded-[38px]";
  const cornerInner = os === "ios" ? "rounded-[42px]" : "rounded-[26px]";

  return (
    <div
      className={`relative mx-auto ${cornerOuter} p-[14px] shadow-2xl shadow-black/60`}
      style={{ width: 393, height: 852, background: "linear-gradient(155deg,#3a3a3f,#111113 40%,#3a3a3f)" }}
    >
      <div className={`relative h-full w-full ${cornerInner} overflow-hidden bg-app-bg flex flex-col`}>
        {locked ? (
          <LockScreen
            onUnlock={() => {
              playLockSound(false);
              setLocked(false);
            }}
          />
        ) : (
          <>
            <StatusBar os={os} />
            <div className="flex-1 min-h-0 flex flex-col relative">
              {children}
              {showVolume && <VolumeHud level={volume} />}
            </div>
            <SystemBar os={os} onHome={onHome} onBack={onBack} />
          </>
        )}
      </div>

      <SideButton side="left" top={170} visualHeight={56} onClick={() => bumpVolume(1)} label="Volume up" />
      <SideButton side="left" top={240} visualHeight={56} onClick={() => bumpVolume(-1)} label="Volume down" />
      <SideButton
        side="right"
        top={200}
        visualHeight={80}
        onClick={() =>
          setLocked((l) => {
            playLockSound(!l);
            return !l;
          })
        }
        label="Power"
      />
    </div>
  );
}
