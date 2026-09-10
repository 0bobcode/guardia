"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function loginWithMicrosoftAction() {
  await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
}

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const redirectUrl = `/login?error=1`;
      const { redirect } = await import("next/navigation");
      redirect(redirectUrl);
    }
    throw err;
  }
}
