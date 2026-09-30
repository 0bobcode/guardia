"use client";

import { useEffect, useRef, useState } from "react";
import {
  CHAT_CATEGORIES,
  CHAT_PROMPTS,
  promptsForCategory,
  searchPrompts,
  type ChatCategory,
  type ChatPrompt,
} from "@/lib/marketingChatbot";

const STORAGE_KEY = "guardia-chat-widget-dismissed";

type Message =
  | { from: "bot"; kind: "text"; text: string }
  | { from: "bot"; kind: "categories" }
  | { from: "bot"; kind: "suggestions"; prompts: ChatPrompt[] }
  | { from: "user"; text: string };

const INTRO =
  "Hi! I'm a scripted FAQ with 100+ canned answers about Guardia — not a real AI. Pick a topic, or type a question and I'll match it to the closest one I know.";

const POPULAR = ["What is Guardia?", "How much does Guardia cost?", "Is my child's data safe?", "How do I log in?"];

/** A real (non-AI) chatbot: every reply below comes from a fixed lookup
 *  table (src/lib/marketingChatbot.ts), matched by keyword overlap. No
 *  request ever leaves the browser and there's no model behind it — the
 *  header says so explicitly so nobody mistakes it for a live agent. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [dismissedLauncher, setDismissedLauncher] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", kind: "text", text: INTRO },
    { from: "bot", kind: "categories" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Reading sessionStorage (an external system) after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem(STORAGE_KEY)) setDismissedLauncher(true);
    } catch {
      // best-effort only
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function ask(prompt: ChatPrompt) {
    setMessages((m) => [...m, { from: "user", text: prompt.q }, { from: "bot", kind: "text", text: prompt.a }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");

    const exact = CHAT_PROMPTS.find((p) => p.q.toLowerCase() === text.toLowerCase());
    if (exact) {
      setMessages((m) => [...m, { from: "user", text }, { from: "bot", kind: "text", text: exact.a }]);
      return;
    }

    const matches = searchPrompts(text, 4);
    if (matches.length > 0) {
      setMessages((m) => [
        ...m,
        { from: "user", text },
        { from: "bot", kind: "text", text: matches[0].a },
        ...(matches.length > 1
          ? ([{ from: "bot", kind: "suggestions", prompts: matches.slice(1) } as Message])
          : []),
      ]);
    } else {
      setMessages((m) => [
        ...m,
        { from: "user", text },
        {
          from: "bot",
          kind: "text",
          text: "I don't have a scripted answer for that one. Here are some questions I can actually answer, or reach a real person via /contact.",
        },
        { from: "bot", kind: "categories" },
      ]);
    }
  }

  function closeLauncher(e: React.MouseEvent) {
    e.stopPropagation();
    setDismissedLauncher(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // best-effort only
    }
  }

  if (open) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm">
        <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0b0f1c] shadow-2xl shadow-black/50 h-[70vh] max-h-[560px]">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
            <div>
              <p className="text-sm font-semibold text-white">Guardia Assistant</p>
              <p className="text-[10px] text-slate-500">Scripted answers · no AI · nothing sent anywhere</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="h-7 w-7 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="dark-scroll flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {messages.map((msg, i) => {
              if (msg.from === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl rounded-br-sm bg-brand-teal text-brand-navy text-[12.5px] font-medium px-3 py-2">
                      {msg.text}
                    </div>
                  </div>
                );
              }
              if (msg.kind === "text") {
                return (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[88%] rounded-xl rounded-bl-sm bg-white/[0.06] border border-white/10 text-slate-200 text-[12.5px] leading-relaxed px-3 py-2">
                      {msg.text}
                    </div>
                  </div>
                );
              }
              if (msg.kind === "categories") {
                return (
                  <div key={i} className="flex flex-wrap gap-1.5">
                    {CHAT_CATEGORIES.map((c) => (
                      <CategoryChip key={c} category={c} onPick={ask} />
                    ))}
                  </div>
                );
              }
              return (
                <div key={i} className="flex flex-col gap-1.5 items-start">
                  {msg.prompts.map((p) => (
                    <button
                      key={p.q}
                      onClick={() => ask(p)}
                      className="text-[11.5px] text-left rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-300 hover:border-brand-teal/40 hover:text-white transition-colors"
                    >
                      {p.q}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 p-2.5">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR.map((q) => {
                const p = CHAT_PROMPTS.find((x) => x.q === q)!;
                return (
                  <button
                    key={q}
                    onClick={() => ask(p)}
                    className="text-[10.5px] rounded-full border border-white/10 px-2.5 py-1 text-slate-400 hover:border-white/30 hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                );
              })}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something…"
                className="flex-1 min-w-0 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-[12.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-teal/60"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-brand-teal text-brand-navy text-xs font-semibold px-3 hover:opacity-90 transition-opacity"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (dismissedLauncher) return null;

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open the Guardia FAQ chat"
      className="group fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-brand-teal to-teal-700 border border-brand-teal/50 shadow-lg shadow-brand-teal/25 flex items-center justify-center text-brand-navy hover:scale-105 active:scale-95 transition-transform"
    >
      <span
        onClick={closeLauncher}
        role="button"
        aria-label="Dismiss chat launcher"
        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white/90 text-brand-navy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
          <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-brand-teal animate-ping" />
      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-brand-teal" />
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function CategoryChip({ category, onPick }: { category: ChatCategory; onPick: (p: ChatPrompt) => void }) {
  const [expanded, setExpanded] = useState(false);
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-[11px] rounded-full border border-white/10 px-2.5 py-1 text-slate-300 hover:border-brand-teal/40 hover:text-white transition-colors"
      >
        {category}
      </button>
    );
  }
  return (
    <div className="w-full flex flex-col gap-1.5 mt-1">
      {promptsForCategory(category).map((p) => (
        <button
          key={p.q}
          onClick={() => onPick(p)}
          className="text-[11.5px] text-left rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-300 hover:border-brand-teal/40 hover:text-white transition-colors"
        >
          {p.q}
        </button>
      ))}
    </div>
  );
}
