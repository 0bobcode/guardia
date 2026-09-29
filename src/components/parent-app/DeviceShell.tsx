"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PhoneFrame } from "./PhoneFrame";
import { TabBar } from "./TabBar";

export type OS = "ios" | "android";

const OSContext = createContext<OS>("ios");
export function useOS(): OS {
  return useContext(OSContext);
}

const STORAGE_KEY = "guardia-parent-os";

export function DeviceShell({ children }: { children: React.ReactNode }) {
  const [os, setOs] = useState<OS>("ios");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ios" || saved === "android") setOs(saved);
    } catch {
      // Best-effort only — falls back to the iOS default.
    }
  }, []);

  function chooseOs(next: OS) {
    setOs(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore — this is just a remembered preview preference.
    }
  }

  const onHomeScreen = pathname === "/parent-app";

  return (
    <OSContext.Provider value={os}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#050608] py-10 px-4">
        <div className="inline-flex rounded-full border border-app-border bg-app-card p-1 text-xs font-medium">
          <button
            onClick={() => chooseOs("ios")}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              os === "ios" ? "bg-app-teal text-app-bg" : "text-app-muted hover:text-app-text"
            }`}
          >
            iOS
          </button>
          <button
            onClick={() => chooseOs("android")}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              os === "android" ? "bg-app-teal text-app-bg" : "text-app-muted hover:text-app-text"
            }`}
          >
            Android
          </button>
        </div>

        <PhoneFrame os={os} onHome={() => router.push("/parent-app")} onBack={() => router.back()}>
          <div className="flex-1 min-h-0 overflow-y-auto dark-scroll">{children}</div>
          {!onHomeScreen && <TabBar />}
        </PhoneFrame>

        <p className="text-xs text-app-faint text-center max-w-xs">
          Guardia Parent — browser preview, not a real device. Layout may differ slightly from a real phone.
        </p>
      </div>
    </OSContext.Provider>
  );
}
