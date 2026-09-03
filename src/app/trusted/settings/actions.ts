"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import type { GradeBand } from "@prisma/client";

const VALID_GRADE_BANDS: GradeBand[] = ["K_5", "G6_8", "G9_12"];

export async function addChildAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const name = String(formData.get("name") ?? "").trim();
  const gradeBand = String(formData.get("gradeBand")) as GradeBand;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const appIds = formData.getAll("appIds").map(String);

  if (!name) redirect("/trusted/settings?error=name");
  if (!VALID_GRADE_BANDS.includes(gradeBand)) redirect("/trusted/settings?error=grade");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/trusted/settings?error=childemail");
  if (password && password.length < 6) redirect("/trusted/settings?error=childpassword");

  // Every parent in this demo belongs to the same district (CCF Schools);
  // a real onboarding flow would let the parent pick/search their district.
  const district = await prisma.district.findFirst();
  if (!district) throw new Error("No district configured");

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const student = await prisma.student.create({
    data: {
      name,
      gradeBand,
      districtId: district.id,
      parentId: session.user.id,
      email: email || null,
      passwordHash,
    },
  });

  const validApps = await prisma.app.findMany({
    where: { districtId: district.id, id: { in: appIds } },
  });
  if (validApps.length > 0) {
    await prisma.studentAppEnrollment.createMany({
      data: validApps.map((app) => ({
        studentId: student.id,
        appId: app.id,
        dailyLimitMin: 180,
        usedTodayMin: 0,
      })),
    });
  }

  revalidatePath("/trusted/settings");
  revalidatePath("/trusted");
  redirect("/trusted/settings?added=1");
}

export async function removeChildAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const studentId = String(formData.get("studentId"));
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.parentId !== session.user.id) throw new Error("Not found");

  const sessions = await prisma.aiSession.findMany({ where: { studentId }, select: { id: true } });
  const sessionIds = sessions.map((s) => s.id);

  await prisma.sessionMessage.deleteMany({ where: { sessionId: { in: sessionIds } } });
  await prisma.aiSession.deleteMany({ where: { studentId } });
  await prisma.consentRequest.deleteMany({ where: { studentId } });
  await prisma.scanEvent.deleteMany({ where: { studentId } });
  await prisma.studentAppEnrollment.deleteMany({ where: { studentId } });
  await prisma.student.delete({ where: { id: studentId } });

  revalidatePath("/trusted/settings");
  revalidatePath("/trusted");
  redirect("/trusted/settings?removed=1");
}

export async function updateDailyLimitAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const enrollmentId = String(formData.get("enrollmentId"));
  const hours = Number(formData.get("hours"));
  if (!Number.isFinite(hours) || hours < 0 || hours > 12) throw new Error("Invalid limit");

  const enrollment = await prisma.studentAppEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { student: true },
  });
  if (!enrollment || enrollment.student.parentId !== session.user.id) throw new Error("Not found");

  await prisma.studentAppEnrollment.update({
    where: { id: enrollmentId },
    data: { dailyLimitMin: Math.round(hours * 60) },
  });

  revalidatePath("/trusted/settings");
  revalidatePath("/trusted");
  redirect("/trusted/settings?saved=1");
}

export async function addAppToChildAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const studentId = String(formData.get("studentId"));
  const appId = String(formData.get("appId"));
  if (!appId) redirect("/trusted/settings?error=noapp");

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.parentId !== session.user.id) throw new Error("Not found");

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app || app.districtId !== student.districtId) throw new Error("Not found");

  await prisma.studentAppEnrollment.upsert({
    where: { studentId_appId: { studentId, appId } },
    update: {},
    create: { studentId, appId, dailyLimitMin: 180, usedTodayMin: 0 },
  });

  revalidatePath("/trusted/settings");
  revalidatePath("/trusted");
  redirect("/trusted/settings?appadded=1");
}

const PAIR_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function randomPairCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += PAIR_CODE_CHARS[Math.floor(Math.random() * PAIR_CODE_CHARS.length)];
  return code;
}

export async function addDevicePairingAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const studentId = String(formData.get("studentId"));
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.parentId !== session.user.id) throw new Error("Not found");

  let pairCode = randomPairCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.devicePairing.findUnique({ where: { pairCode } });
    if (!existing) break;
    pairCode = randomPairCode();
  }

  await prisma.devicePairing.create({ data: { studentId, pairCode } });

  revalidatePath("/trusted/settings");
  redirect(`/trusted/settings?paired=${pairCode}`);
}

export async function removeDevicePairingAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const pairingId = String(formData.get("pairingId"));
  const pairing = await prisma.devicePairing.findUnique({ where: { id: pairingId }, include: { student: true } });
  if (!pairing || pairing.student.parentId !== session.user.id) throw new Error("Not found");

  await prisma.devicePairing.delete({ where: { id: pairingId } });

  revalidatePath("/trusted/settings");
  redirect("/trusted/settings?deviceremoved=1");
}

export async function removeAppFromChildAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const enrollmentId = String(formData.get("enrollmentId"));
  const enrollment = await prisma.studentAppEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { student: true },
  });
  if (!enrollment || enrollment.student.parentId !== session.user.id) throw new Error("Not found");

  await prisma.studentAppEnrollment.delete({ where: { id: enrollmentId } });

  revalidatePath("/trusted/settings");
  revalidatePath("/trusted");
  redirect("/trusted/settings?appremoved=1");
}
