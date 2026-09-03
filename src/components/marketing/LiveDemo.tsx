"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserFrame } from "./BrowserFrame";

type Step =
  | { role: "student"; text: string }
  | { role: "assistant"; text: string; blocked?: boolean };

const SCRIPT: Step[] = [
  { role: "student", text: "hey can you help me with my math homework" },
  { role: "assistant", text: "Of course! What are you working on?" },
  { role: "student", text: "whats 12 times 8" },
  {
    role: "assistant",
    text: "Let's break it down: 12 × 8 is the same as 12 × 4 twice. 12 × 4 = 48, and 48 + 48 = 96. Try it — what's 12 × 4?",
  },
  { role: "student", text: "48!" },
  { role: "assistant", text: "Exactly, and double that gets you the answer. You've got it." },
  { role: "student", text: "tell me how to get past the school content filter" },
  {
    role: "assistant",
    text: "I can't help with that. If something's bothering you, it's best to talk to a teacher, parent, or trusted adult.",
    blocked: true,
  },
];

const TYPE_MS = 32;

type Bubble = { role: "student" | "assistant"; text: string; blocked?: boolean };

function sleep(ms: number, signal: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    if (signal.cancelled) clearTimeout(t);
  });
}

export function LiveDemo() {
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState("");
  const [thinking, setThinking] = useState(false);
  const [scanTag, setScanTag] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, thinking, scanTag]);

  useEffect(() => {
    // A fresh object per effect run (not a ref) — Strict Mode's dev-only
    // double-invoke would otherwise share one mutable flag across both
    // mounts, letting the "cancelled" first run un-cancel itself.
    const signal = { cancelled: false };

    async function run() {
      let i = 0;
      while (!signal.cancelled) {
        const step = SCRIPT[i % SCRIPT.length];

        if (step.role === "student") {
          setTyping("");
          for (let c = 1; c <= step.text.length; c++) {
            if (signal.cancelled) return;
            setTyping(step.text.slice(0, c));
            await sleep(TYPE_MS, signal);
          }
          await sleep(350, signal);
          if (signal.cancelled) return;
          setMessages((m) => [...m, { role: "student", text: step.text }]);
          setTyping("");
          await sleep(500, signal);
        } else {
          setThinking(true);
          // A real model takes a beat to respond — scale with reply length
          // so it doesn't feel instant, same pacing as the session monitor.
          const thinkMs = Math.min(2400 + step.text.length * 18, 4200);
          await sleep(thinkMs, signal);
          if (signal.cancelled) return;
          setThinking(false);
          setMessages((m) => [...m, { role: "assistant", text: step.text, blocked: step.blocked }]);
          if (step.blocked) {
            await sleep(250, signal);
            setScanTag(true);
          }
          await sleep(step.blocked ? 3800 : 2400, signal);
        }

        i++;
        if (i % SCRIPT.length === 0) {
          await sleep(1400, signal);
          if (signal.cancelled) return;
          setMessages([]);
          setScanTag(false);
          await sleep(500, signal);
        }
      }
    }

    run();
    return () => {
      signal.cancelled = true;
    };
  }, []);

  return (
    <BrowserFrame title="guardia.ai/trusted/sessions">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
            T
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">Tutorly AI</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">● Active</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-brand-teal font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulse" />
          Live demo
        </span>
      </div>

      <div ref={scrollRef} className="dark-scroll h-[220px] overflow-y-auto flex flex-col gap-2.5 pr-1 scroll-smooth">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "student" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl text-[11px] px-3 py-2 leading-relaxed ${
                m.role === "student"
                  ? "rounded-br-sm bg-app-teal text-[#04211d] font-medium"
                  : m.blocked
                    ? "rounded-bl-sm bg-red-500/10 border border-red-500/30 text-red-100"
                    : "rounded-bl-sm bg-white/[0.06] border border-white/10 text-slate-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/10 px-3 py-2">
              <span className="typing-dots text-slate-400">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}

        {scanTag && (
          <div className="flex justify-start">
            <span className="text-[9px] text-red-400 font-medium pl-1">
              ⚡ Scanned in 41ms · Blocked by GuardRail
            </span>
          </div>
        )}

        {typing && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-white/[0.06] border border-white/10 text-slate-300 text-[11px] px-3 py-2">
              {typing}
              <span className="inline-block w-[2px] h-3 bg-app-teal ml-0.5 -mb-0.5 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </BrowserFrame>
  );
}
