import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { appNameForPackage } from "@/lib/devicePackages";
import { rateLimit, clientIp } from "@/lib/rateLimit";

// Reports today's total usage minutes for one app — no message content
// involved at all. Built for the iOS companion's Family Controls /
// DeviceActivity reporting, which only ever sees durations, never what was
// typed or said. `minutes` is the day's running total (not a delta), which
// matches how DeviceActivityMonitor naturally reports and makes retries
// safe — sending the same total twice just re-sets the same value.
export async function POST(req: Request) {
  const { allowed, retryAfterSeconds } = rateLimit(`device-usage:${clientIp(req)}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests, try again shortly" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const packageName = typeof body?.packageName === "string" ? body.packageName : "";
  const minutes = Number(body?.minutes);

  if (!token) return NextResponse.json({ error: "token is required" }, { status: 401 });
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 24 * 60) {
    return NextResponse.json({ error: "minutes must be between 0 and 1440" }, { status: 400 });
  }

  const pairing = await prisma.devicePairing.findUnique({
    where: { token },
    include: { student: true },
  });
  if (!pairing || !pairing.pairedAt) {
    return NextResponse.json({ error: "Unknown or unpaired device" }, { status: 401 });
  }

  const appName = appNameForPackage(packageName);
  if (!appName) {
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

  await prisma.studentAppEnrollment.upsert({
    where: { studentId_appId: { studentId: student.id, appId: app.id } },
    update: { usedTodayMin: Math.round(minutes) },
    create: {
      studentId: student.id,
      appId: app.id,
      usedTodayMin: Math.round(minutes),
    },
  });

  return NextResponse.json({ ok: true, tracked: true });
}
