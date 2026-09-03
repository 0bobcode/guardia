import { providerShortLabel } from "@/lib/aiProviders";

const STYLES: Record<string, string> = {
  anthropic: "text-orange-300 bg-orange-500/10",
  openai: "text-emerald-300 bg-emerald-500/10",
  google: "text-blue-300 bg-blue-500/10",
};

/**
 * Shows which model powers an app — e.g. "Tutorly AI [via Claude]". Hides
 * itself when the app name already IS the provider (e.g. the standalone
 * "Claude" app), where the badge would just repeat the name.
 */
export function ProviderBadge({
  provider,
  appName,
  className,
}: {
  provider: string;
  appName?: string;
  className?: string;
}) {
  const label = providerShortLabel(provider);
  if (appName && appName === label) return null;

  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STYLES[provider] ?? "text-app-faint bg-white/5"} ${className ?? ""}`}
    >
      via {label}
    </span>
  );
}
