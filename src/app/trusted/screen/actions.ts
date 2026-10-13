"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { expireStale } from "@/lib/screenShare";

// Asking is all a parent can do — the session only goes live if the child's
// device accepts it (see /api/device/screen/respond).
export async function requestScreenShareAction(formData: FormData) {
  const session = await requireActionUser("PARENT");
  const studentId = String(formData.get("studentId") ?? "");
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.parentId !== session.user.id) throw new Error("Not found");

  const deviceId = String(formData.get("deviceId") ?? "");
  const device = await prisma.devicePairing.findFirst({ where: { id: deviceId, studentId, pairedAt: { not: null } } });
  if (!device) redirect("/trusted/settings?error=noscreendevice");

  await expireStale(studentId);
  const open = await prisma.screenShareSession.findFirst({
    where: { studentId, deviceId: device.id, status: { in: ["REQUESTED", "ACTIVE"] } },
    orderBy: { requestedAt: "desc" },
  });
  const target =
    open ??
    (await prisma.screenShareSession.create({
      data: { studentId, requestedById: session.user.id, deviceId: device.id },
    }));
  redirect(`/trusted/screen/${target.id}`);
}

export async function stopScreenShareAction(formData: FormData) {
  const session = await requireActionUser("PARENT");
  const id = String(formData.get("id") ?? "");
  const found = await prisma.screenShareSession.findUnique({ where: { id }, include: { student: { select: { parentId: true } } } });
  if (!found || found.student.parentId !== session.user.id) throw new Error("Not found");

  await prisma.screenShareSession.updateMany({
    where: { id, status: { in: ["REQUESTED", "ACTIVE"] } },
    data: { status: "ENDED", endedAt: new Date(), endedBy: "PARENT", lastFrame: null },
  });
  revalidatePath(`/trusted/screen/${id}`);
  redirect(`/trusted/screen/${id}`);
}
