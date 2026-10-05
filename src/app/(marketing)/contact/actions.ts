"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function submitContactAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const fromOrb = formData.get("ref") === "orb";
  const interest = fromOrb ? "Orb claim" : String(formData.get("interest") ?? "General inquiry");
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=1");
  }

  await prisma.contactRequest.create({
    data: { name, email, organization: organization || null, interest, message },
  });

  redirect("/contact?sent=1");
}
