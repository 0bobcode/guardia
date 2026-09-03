import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { RiskBadge } from "@/components/RiskBadge";
import { ProviderBadge } from "@/components/ProviderBadge";
import { JumpToMessage } from "@/components/JumpToMessage";
import { RevealBubble } from "@/components/RevealBubble";
import { formatDateTime, formatTime } from "@/lib/format";
import { flagMessageAction } from "./actions";

function Avatar({ initial, kind }: { initial: string; kind: "student" | "ai" }) {
  return (
    <div
      className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
        kind === "student" ? "bg-app-teal text-[#04211d]" : "bg-white/10 text-app-text border border-app-border"
      }`}
    >
      {initial.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jump?: string }>;
}) {
  const session = await requireRole("PARENT");
  const { id } = await params;
  const { jump } = await searchParams;

  const aiSession = await prisma.aiSession.findUnique({
    where: { id },
    include: { app: true, student: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!aiSession || aiSession.student.parentId !== session.user.id) notFound();

  const flaggedCount = aiSession.messages.filter((m) => m.riskLevel !== "NONE").length;
  const studentInitial = aiSession.student.name;
  const appInitial = aiSession.app.name;

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <Link href="/trusted/sessions" className="text-xs text-app-muted hover:text-app-text inline-flex items-center gap-1 mb-4">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All sessions
      </Link>

      <div className="app-card rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Avatar initial={appInitial} kind="ai" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-app-text">{aiSession.app.name}</h1>
                <ProviderBadge provider={aiSession.app.provider} appName={aiSession.app.name} />
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  Active
                </span>
              </div>
              <p className="text-sm text-app-muted mt-0.5">
                {aiSession.student.name} · {aiSession.app.subject}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-app-faint">{formatDateTime(aiSession.startedAt)}</p>
            {flaggedCount > 0 ? (
              <p className="text-xs font-medium text-amber-400 mt-1">{flaggedCount} moment{flaggedCount === 1 ? "" : "s"} flagged</p>
            ) : (
              <p className="text-xs font-medium text-emerald-400 mt-1">No safety concerns</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {aiSession.messages.map((m, i) => {
          const isStudent = m.role === "STUDENT";
          const isConcern = m.riskLevel !== "NONE";
          const isNew = m.id === jump;
          const bubbleClass = `rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isStudent
              ? isConcern
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-100 rounded-br-sm"
                : "bg-app-teal text-[#04211d] rounded-br-sm font-medium"
              : "app-card text-app-text rounded-bl-sm"
          }`;
          return (
            <div
              key={m.id}
              id={`msg-${m.id}`}
              className={`msg-row flex items-end gap-2 ${isStudent ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${Math.min(i * 45, 450)}ms` }}
            >
              {!isStudent && <Avatar initial={appInitial} kind="ai" />}
              <div className={`max-w-[75%] ${isStudent ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`flex items-center gap-2 px-1 ${isStudent ? "flex-row-reverse" : ""}`}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-app-faint">
                    {isStudent ? studentInitial.split(" ")[0] : aiSession.app.name}
                  </span>
                  <span className="text-[10px] text-app-faint">{formatTime(m.createdAt)}</span>
                </div>
                {isNew ? (
                  <RevealBubble className={bubbleClass}>{m.content}</RevealBubble>
                ) : (
                  <div className={bubbleClass}>{m.content}</div>
                )}
                <div className={`flex items-center gap-2 px-1 ${isStudent ? "flex-row-reverse" : ""}`}>
                  {isConcern && <RiskBadge level={m.riskLevel} />}
                  {isStudent && !m.parentFlagged && (
                    <form action={flagMessageAction}>
                      <input type="hidden" name="messageId" value={m.id} />
                      <button
                        type="submit"
                        className="flex items-center gap-1 text-[10px] text-app-faint hover:text-amber-400 transition-colors"
                        title="Flag this message"
                      >
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                          <path d="M3 2v12M3 2.5h8l-1.5 2.5L11 7.5H3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Flag
                      </button>
                    </form>
                  )}
                  {isStudent && m.parentFlagged && (
                    <span className="text-[10px] text-amber-400 font-medium">You flagged this</span>
                  )}
                </div>
              </div>
              {isStudent && <Avatar initial={studentInitial} kind="student" />}
            </div>
          );
        })}
      </div>
      <Suspense fallback={null}>
        <JumpToMessage />
      </Suspense>
    </div>
  );
}
