"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useOS } from "./DeviceShell";
import { playTapSound } from "@/lib/parent-app/sound";

export function AppIcon({ href, label }: { href: string; label: string }) {
  const os = useOS();

  return (
    <Link
      href={href}
      onClick={playTapSound}
      className="flex flex-col items-center gap-1.5 w-20 active:scale-95 transition-transform"
    >
      <div
        className={`h-16 w-16 flex items-center justify-center shadow-lg shadow-black/40 ${
          os === "ios" ? "rounded-[18px]" : "rounded-full"
        }`}
        style={{ background: "linear-gradient(155deg,#0b1739,#050608)" }}
      >
        <Logo size={36} />
      </div>
      <span className="text-[11px] font-medium text-white drop-shadow-sm">{label}</span>
    </Link>
  );
}
