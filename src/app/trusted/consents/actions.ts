"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import type { ConsentStatus } from "@prisma/client";

export async function respondToConsentAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const consentId = String(formData.get("consentId"));
  const decision = String(formData.get("decision")) as ConsentStatus;

  const consent = await prisma.consentRequest.findUnique({
    where: { id: consentId },
    include: { student: true },
  });
  if (!consent || consent.student.parentId !== session.user.id) throw new Error("Not found");
  if (consent.status !== "PENDING") redirect("/trusted/consents");

  await prisma.consentRequest.update({
    where: { id: consentId },
    data: { status: decision, respondedAt: new Date() },
  });

  revalidatePath("/trusted/consents");
  revalidatePath("/trusted");
  redirect("/trusted/consents?saved=1");
}
