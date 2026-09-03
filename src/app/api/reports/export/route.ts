import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "DISTRICT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const districtId = session.user.districtId!;

  const events = await prisma.scanEvent.findMany({
    where: { districtId },
    orderBy: { createdAt: "desc" },
    include: { app: true, student: true },
  });

  const header = [
    "timestamp",
    "app",
    "student",
    "grade_band",
    "query",
    "categories",
    "risk_level",
    "action",
  ];
  const rows = events.map((e) =>
    [
      e.createdAt.toISOString(),
      e.app.name,
      e.student?.name ?? "",
      e.gradeBand,
      e.queryText,
      e.categories,
      e.riskLevel,
      e.action,
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="guardrail-audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
