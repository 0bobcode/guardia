import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scanText } from "@/lib/scanEngine";
import { appNameForPackage } from "@/lib/devicePackages";
import type { GradeBand, MessageRole } from "@prisma/client";

// A session groups nearby messages the way a real conversation would; a gap
// this long starting a new one keeps two separate chats from the same day
// merging into one endless transcript.
const SESSION_GAP_MS = 20 * 60 * 1000;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const packageName = typeof body?.packageName === "string" ? body.packageName : "";
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const role: MessageRole = body?.role === "ASSISTANT" ? "ASSISTANT" : "STUDENT";

  if (!token) return NextResponse.json({ error: "token is required" }, { status: 401 });
  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

  const pairing = await prisma.devicePairing.findUnique({
    where: { token },
    include: { student: true },
  });
  if (!pairing || !pairing.pairedAt) {
    return NextResponse.json({ error: "Unknown or unpaired device" }, { status: 401 });
  }

  const appName = appNameForPackage(packageName);
  if (!appName) {
    // Not an app Guardia tracks — accept and drop, so the device doesn't retry.
    return NextResponse.json({ ok: true, tracked: false });
  }

  await prisma.devicePairing.update({ where: { id: pairing.id }, data: { lastSeenAt: new Date() } });

  const student = pairing.student;
  const app = await prisma.app.upsert({
    where: { districtId_name: { districtId: student.districtId, name: appName } },
    update: {},
    create: {
      districtId: student.districtId,
      name: appName,
      subject: "General AI Assistant",
      provider: appName === "Gemini" ? "google" : appName === "ChatGPT" ? "openai" : "anthropic",
    },
  });

  const gradeBand: GradeBand = student.gradeBand;
  const policies = await prisma.policy.findMany({ where: { districtId: student.districtId, gradeBand } });
  const rules = policies.map((p) => ({
    category: p.category,
    keywords: p.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    action: p.action,
    enabled: p.enabled,
  }));
  const result = scanText(text, rules);

  const cutoff = new Date(Date.now() - SESSION_GAP_MS);
  let aiSession = await prisma.aiSession.findFirst({
    where: { studentId: student.id, appId: app.id, startedAt: { gte: cutoff }, endedAt: null },
    orderBy: { startedAt: "desc" },
  });
  if (!aiSession) {
    aiSession = await prisma.aiSession.create({
      data: { studentId: student.id, appId: app.id, startedAt: new Date() },
    });
  }

  await prisma.sessionMessage.create({
    data: {
      sessionId: aiSession.id,
      role,
      content: text,
      riskLevel: result.riskLevel,
      action: result.action,
    },
  });

  if (role === "STUDENT") {
    await prisma.scanEvent.create({
      data: {
        queryText: text,
        riskLevel: result.riskLevel,
        action: result.action,
        categories: result.matchedCategories.join(", "),
        gradeBand,
        districtId: student.districtId,
        appId: app.id,
        studentId: student.id,
      },
    });
  }

  return NextResponse.json({ ok: true, tracked: true, ...result });
}
