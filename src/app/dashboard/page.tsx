import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardDispatch() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "DISTRICT_ADMIN") redirect("/guardrail");
  redirect("/trusted");
}
