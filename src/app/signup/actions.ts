"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";

function fail(reason: string): never {
  redirect(`/signup?error=${reason}`);
}

export async function signupAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name) fail("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("email");
  if (password.length < 8) fail("password");
  if (password !== confirm) fail("mismatch");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) fail("exists");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "PARENT" },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login?error=1");
    throw err;
  }
}
