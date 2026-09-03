import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { PROVIDERS, providerConnected, providerLabel } from "@/lib/aiProviders";

export default async function SettingsPage() {
  const session = await requireRole("DISTRICT_ADMIN");
  const districtId = session!.user.districtId!;
  const district = await prisma.district.findUnique({
    where: { id: districtId },
    include: { apps: { where: { name: { not: "Policy Tester" } } } },
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-app-text mb-1">Settings</h1>
      <p className="text-sm text-app-muted mb-6">Organization and integration details.</p>

      <div className="app-card rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-app-text mb-3">Organization</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-app-muted">District name</p>
            <p className="text-app-text font-medium">{district?.name}</p>
          </div>
          <div>
            <p className="text-xs text-app-muted">Admin</p>
            <p className="text-app-text font-medium">{session!.user.name}</p>
          </div>
          <div>
            <p className="text-xs text-app-muted">Contact email</p>
            <p className="text-app-text font-medium">{session!.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-app-muted">Plan</p>
            <p className="text-app-text font-medium">Compliance Suite</p>
          </div>
        </div>
      </div>

      <div className="app-card rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-app-text mb-1">AI Provider Integrations</h2>
        <p className="text-xs text-app-muted mb-3">
          GuardRail scans content before it reaches any of these models. Connect a provider by adding
          its API key to your environment.
        </p>
        <div className="space-y-2">
          {PROVIDERS.map((p) => {
            const connected = providerConnected(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm border border-app-border rounded-md px-3 py-2"
              >
                <div>
                  <span className="text-app-text font-medium">{p.label}</span>
                  <span className="text-app-faint text-xs block font-mono">{p.envVar}</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                    connected ? "text-emerald-400 bg-emerald-500/10" : "text-app-faint bg-white/5"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-app-faint"}`} />
                  {connected ? "Connected" : "Not configured"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="app-card rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-app-text mb-3">Integrated Apps</h2>
        <p className="text-xs text-app-muted mb-3">
          Apps sending traffic through the GuardRail compliance layer.
        </p>
        <div className="space-y-2">
          {district?.apps.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between text-sm border border-app-border rounded-md px-3 py-2"
            >
              <div>
                <span className="text-app-text font-medium">{app.name}</span>
                <span className="text-app-muted text-xs block">{app.subject}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-app-muted block">{providerLabel(app.provider)}</span>
                <span className="text-app-faint text-[10px] font-mono">{app.model}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="app-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-app-text mb-3">API Integration</h2>
        <p className="text-xs text-app-muted mb-3">
          REST API — any AI platform, any language. Average integration time under 4 hours.
        </p>
        <div className="bg-black/40 border border-app-border text-slate-300 rounded-md p-3 text-xs font-mono overflow-x-auto">
          POST /api/scan{"\n"}
          {"{"} &quot;text&quot;: &quot;...&quot;, &quot;gradeBand&quot;: &quot;K_5&quot;, &quot;appId&quot;: &quot;...&quot; {"}"}
          {"\n\n"}→ {"{"} &quot;action&quot;: &quot;PASSED&quot;, &quot;reply&quot;: {"{"} &quot;text&quot;: &quot;...&quot;, &quot;live&quot;: true {"}"} {"}"}
        </div>
      </div>
    </div>
  );
}
