import { AppIcon } from "@/components/parent-app/AppIcon";

// The simulated home screen for the parent's phone. Only Guardia Parent is
// installed here — no fake Messages/Camera/Photos icons cluttering it up,
// since the point of this preview is the one app that matters.
export default function ParentAppLockHome() {
  return (
    <div
      className="h-full flex flex-col items-center pt-10 px-6"
      style={{ background: "radial-gradient(circle at 30% 20%, #12243f, #050608 65%)" }}
    >
      <AppIcon href="/parent-app/home" label="Guardia" />
    </div>
  );
}
