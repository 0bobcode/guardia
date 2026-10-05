"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyResetToken } from "@/lib/passwordReset";

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const back = (error: string) => redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${error}`);

  const user = await verifyResetToken(token);
  if (!user) redirect("/reset-password?token=invalid");

  if (password.length < 8) back("password");
  if (password !== confirm) back("mismatch");

  // Changing the hash also invalidates this token (and any other outstanding
  // ones), since each token's signature covers the old hash.
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });

  redirect("/login?reset=1");
}
