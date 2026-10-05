import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CATEGORY_DEFS } from "@/lib/scanEngine";

const LABELS = Object.fromEntries(CATEGORY_DEFS.map((c) => [c.key, c.label]));

// New HIGH-risk scan events since a timestamp, scoped to what the caller may
// see: a parent sees their own children's, a district admin sees their
// district's. Never returns the message text — just who/where/what category.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = Number(new URL(req.url).searchParams.get("since"));
  if (!Number.isFinite(since) || since <= 0) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  let scope: { districtId: string } | { studentId: { in: string[] } };
  if (session.user.role === "DISTRICT_ADMIN") {
    if (!session.user.districtId) return NextResponse.json({ alerts: [] });
    scope = { districtId: session.user.districtId };
  } else {
    const kids = await prisma.student.findMany({ where: { parentId: session.user.id }, select: { id: true } });
    if (kids.length === 0) return NextResponse.json({ alerts: [] });
    scope = { studentId: { in: kids.map((k) => k.id) } };
  }

  const events = await prisma.scanEvent.findMany({
    where: { ...scope, riskLevel: "HIGH", createdAt: { gt: new Date(since) } },
    orderBy: { createdAt: "asc" },
    take: 5,
    include: { app: { select: { name: true } }, student: { select: { name: true } } },
  });

  return NextResponse.json({
    alerts: events.map((e) => ({
      id: e.id,
      at: e.createdAt.getTime(),
      action: e.action,
      student: e.student?.name ?? null,
      app: e.app.name,
      categories: e.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => LABELS[c] ?? c),
    })),
  });
}
