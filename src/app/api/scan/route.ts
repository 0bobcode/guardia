import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scanText } from "@/lib/scanEngine";
import { generateAiReply, providerLabel, TUTOR_SYSTEM_PROMPT } from "@/lib/aiProviders";
import type { GradeBand } from "@prisma/client";

const VALID_GRADE_BANDS: GradeBand[] = ["K_5", "G6_8", "G9_12"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DISTRICT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const districtId = session.user.districtId!;

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";
  const gradeBand = VALID_GRADE_BANDS.includes(body?.gradeBand) ? body.gradeBand : "K_5";
  const dryRun = body?.dryRun !== false;
  const appId = typeof body?.appId === "string" ? body.appId : null;

  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const policies = await prisma.policy.findMany({ where: { districtId, gradeBand } });
  const rules = policies.map((p) => ({
    category: p.category,
    keywords: p.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    action: p.action,
    enabled: p.enabled,
  }));

  const result = scanText(text, rules);

  // The core GuardRail pattern: only PASSED content ever reaches the model.
  // Flagged/blocked content gets a fixed compliance-reviewed message instead
  // of letting a model improvise around a safety refusal.
  let reply: { text: string; live: boolean; provider: string; model: string } | null = null;
  if (result.action === "PASSED" && appId) {
    const app = await prisma.app.findFirst({ where: { id: appId, districtId } });
    if (app) {
      const generated = await generateAiReply(app.provider, app.model, TUTOR_SYSTEM_PROMPT, text);
      reply = { ...generated, provider: providerLabel(app.provider), model: app.model };
    }
  }

  if (!dryRun) {
    let tester = await prisma.app.findFirst({ where: { districtId, name: "Policy Tester" } });
    if (!tester) {
      tester = await prisma.app.create({
        data: { districtId, name: "Policy Tester", subject: "Internal" },
      });
    }
    await prisma.scanEvent.create({
      data: {
        queryText: text,
        riskLevel: result.riskLevel,
        action: result.action,
        categories: result.matchedCategories.join(", "),
        gradeBand,
        districtId,
        appId: tester.id,
      },
    });
  }

  return NextResponse.json({ ...result, reply });
}
