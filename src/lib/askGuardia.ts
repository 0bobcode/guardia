import { prisma } from "@/lib/db";
import { runLocalBriefAi } from "@/lib/pythonAi";
import type { RiskLevel } from "@prisma/client";

// "Ask Guardia" — a Rolli-style natural-language brief. The stats and
// highlights below are always computed directly from real rows (never from
// the model), so the brief can't hallucinate a number. The summary sentence
// itself is phrased by a small local, rule-based Python script (see
// scripts/ask_brief_ai.py) — no external API, no key, no network call —
// with a plain templated fallback if that script isn't available.

export type BriefHighlight = { severity: "HIGH" | "MEDIUM" | "LOW"; title: string; detail: string };

export type Brief = {
  summary: string;
  windowDays: number;
  stats: { totalMessages: number; flaggedCount: number; blockedCount: number; topApp: string | null };
  highlights: BriefHighlight[];
  live: boolean;
};

const WINDOW_DAYS = 14;

function riskRank(r: RiskLevel): number {
  return r === "HIGH" ? 3 : r === "MED" ? 2 : r === "LOW" ? 1 : 0;
}

function severityForRisk(r: RiskLevel): "HIGH" | "MEDIUM" | "LOW" {
  return r === "HIGH" ? "HIGH" : r === "MED" ? "MEDIUM" : "LOW";
}

function topCategories(events: { categories: string; riskLevel: RiskLevel }[], suffix: string): BriefHighlight[] {
  const counts = new Map<string, { count: number; risk: RiskLevel }>();
  for (const e of events) {
    for (const cat of e.categories.split(",").map((c) => c.trim()).filter(Boolean)) {
      const existing = counts.get(cat) ?? { count: 0, risk: e.riskLevel };
      existing.count += 1;
      if (riskRank(e.riskLevel) > riskRank(existing.risk)) existing.risk = e.riskLevel;
      counts.set(cat, existing);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4)
    .map(([title, { count, risk }]) => ({
      severity: severityForRisk(risk),
      title,
      detail: `${count} flagged ${suffix} in the last ${WINDOW_DAYS} days`,
    }));
}

export async function buildStudentBrief(studentId: string, question: string): Promise<Brief> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [student, messages, scanEvents] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, select: { name: true } }),
    prisma.sessionMessage.findMany({
      where: { session: { studentId }, createdAt: { gte: since } },
      include: { session: { include: { app: true } } },
    }),
    prisma.scanEvent.findMany({ where: { studentId, createdAt: { gte: since } } }),
  ]);

  const flagged = scanEvents.filter((e) => e.riskLevel !== "NONE");
  const blocked = scanEvents.filter((e) => e.action === "BLOCKED");

  const appCounts = new Map<string, number>();
  for (const m of messages) appCounts.set(m.session.app.name, (appCounts.get(m.session.app.name) ?? 0) + 1);
  const topApp = [...appCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const highlights = topCategories(flagged, "message" + (flagged.length === 1 ? "" : "s"));

  const stats = { totalMessages: messages.length, flaggedCount: flagged.length, blockedCount: blocked.length, topApp };

  const statsLine =
    `${messages.length} messages across ${appCounts.size} app${appCounts.size === 1 ? "" : "s"} in the last ${WINDOW_DAYS} days. ` +
    `${flagged.length} flagged, ${blocked.length} blocked. ` +
    (highlights.length ? `Top categories: ${highlights.map((h) => h.title).join(", ")}.` : "No policy matches.");

  const aiSummary = await runLocalBriefAi({
    scope: "student",
    subject: student?.name ?? "this child",
    question,
    windowDays: WINDOW_DAYS,
    stats,
    highlights,
  });

  return {
    summary: aiSummary ?? statsLine,
    windowDays: WINDOW_DAYS,
    stats,
    highlights,
    live: aiSummary !== null,
  };
}

export async function buildDistrictBrief(districtId: string, question: string): Promise<Brief> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [district, events] = await Promise.all([
    prisma.district.findUnique({ where: { id: districtId }, select: { name: true } }),
    prisma.scanEvent.findMany({ where: { districtId, createdAt: { gte: since } }, include: { app: true } }),
  ]);
  const flagged = events.filter((e) => e.riskLevel !== "NONE");
  const blocked = events.filter((e) => e.action === "BLOCKED");

  const appCounts = new Map<string, number>();
  for (const e of events) appCounts.set(e.app.name, (appCounts.get(e.app.name) ?? 0) + 1);
  const topApp = [...appCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const highlights = topCategories(flagged, "scan" + (flagged.length === 1 ? "" : "s") + " district-wide");

  const stats = { totalMessages: events.length, flaggedCount: flagged.length, blockedCount: blocked.length, topApp };

  const statsLine =
    `${events.length} scans across ${appCounts.size} app${appCounts.size === 1 ? "" : "s"} district-wide in the last ${WINDOW_DAYS} days. ` +
    `${flagged.length} flagged, ${blocked.length} blocked. ` +
    (highlights.length ? `Top categories: ${highlights.map((h) => h.title).join(", ")}.` : "No policy matches.");

  const aiSummary = await runLocalBriefAi({
    scope: "district",
    subject: district?.name ?? "the district",
    question,
    windowDays: WINDOW_DAYS,
    stats,
    highlights,
  });

  return {
    summary: aiSummary ?? statsLine,
    windowDays: WINDOW_DAYS,
    stats,
    highlights,
    live: aiSummary !== null,
  };
}
