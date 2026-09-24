"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";

export async function updateOsVersionAction(formData: FormData) {
  const session = await requireActionUser("DISTRICT_ADMIN");
  const districtId = session.user.districtId!;

  const osVersion = String(formData.get("osVersion") ?? "").trim().slice(0, 30);
  if (!osVersion) redirect("/guardrail/settings?error=osversion");

  await prisma.district.update({ where: { id: districtId }, data: { osVersion } });

  revalidatePath("/guardrail/settings");
  revalidatePath("/guardrail");
  redirect("/guardrail/settings?osversionsaved=1");
}
