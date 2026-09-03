"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

const DEMO: Record<string, { email: string; password: string }> = {
  admin: { email: "admin@ccfschools.edu", password: "guardia-demo" },
  parent: { email: "priya@guardia-demo.com", password: "guardia-demo" },
};

export async function demoLoginAction(formData: FormData) {
  const role = String(formData.get("role"));
  const creds = DEMO[role];
  if (!creds) return;

  try {
    await signIn("credentials", { ...creds, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login?error=1");
    throw err;
  }
}
