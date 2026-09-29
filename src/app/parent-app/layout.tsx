import { requireRole } from "@/lib/requireSession";
import { DeviceShell } from "@/components/parent-app/DeviceShell";

export default async function ParentAppLayout({ children }: { children: React.ReactNode }) {
  await requireRole("PARENT");

  return <DeviceShell>{children}</DeviceShell>;
}
