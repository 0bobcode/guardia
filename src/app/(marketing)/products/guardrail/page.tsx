import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GuardRail — Guardia",
  description: "AI Safety Compliance API for schools and ed-tech vendors.",
};

const HOW_IT_WORKS = [
  {
    title: "Content Scanning",
    detail: "Real-time analysis against age-appropriate safety policies; configurable by grade band (K-5, 6-8, 9-12).",
  },
  {
    title: "Compliance Reporting",
    detail: "Auto-generated audit trails formatted for Ohio, TX, and 10+ emerging state regulations.",
  },
  {
    title: "REST API Integration",
    detail: "Standard API — any AI platform, any language. Average integration time under 4 hours.",
  },
  {
    title: "Policy Management",
    detail: "Age-tiered rule presets with custom override; district admins control their own policies.",
  },
];

export default function GuardRailPage() {
  return (
    <>
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="text-brand-teal text-sm font-semibold tracking-wide uppercase mb-4">
            AI Safety Compliance API
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
            Real-time content safety, built for the classroom.
          </h1>
          <p className="mt-5 text-slate-300 max-w-xl">
            GuardRail sits between any AI application and the child using it — scanning every
            interaction, blocking or flagging what&apos;s unsafe, and generating the audit trail
            regulators require.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 transition-opacity"
            >
              Sign in to the console
            </Link>
            <Link
              href="/contact"
              className="px-5 py-3 rounded-md border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 grid sm:grid-cols-2 gap-6">
        {[
          "Real-time detection of harmful AI outputs",
          "Compliance layer for state child-safety laws",
          "API-first: integrates in hours, not months",
          "Audit logs & regulatory reporting built-in",
        ].map((f) => (
          <div key={f} className="flex items-start gap-3 border border-brand-border rounded-lg p-4">
            <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="8" fill="#0ea5a0" fillOpacity="0.12" />
              <path d="M4.5 8.2l2.2 2.2 4.8-5" stroke="#0ea5a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-slate-700">{f}</p>
          </div>
        ))}
      </section>

      <section className="bg-slate-50 border-y border-brand-border">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-xl font-bold text-brand-ink mb-2">How it works</h2>
          <p className="text-sm text-brand-muted mb-4">
            AI Application → GuardRail Compliance Layer → Block / Alert → Safe Output + Audit Log
          </p>
          <div className="grid sm:grid-cols-2 gap-5 mt-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="bg-white border border-brand-border rounded-xl p-5">
                <span className="text-xs font-bold text-brand-teal">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-sm font-semibold text-brand-ink mt-1">{step.title}</h3>
                <p className="text-sm text-brand-muted mt-1.5">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-xl font-bold text-brand-ink mb-4">Integration</h2>
        <p className="text-sm text-brand-muted mb-4">
          One endpoint. Send the text, get back a risk level and an action.
        </p>
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
          POST /api/scan{"\n"}
          {"{"} &quot;text&quot;: &quot;...&quot;, &quot;gradeBand&quot;: &quot;K_5&quot; {"}"}
          {"\n\n"}→ {"{"} &quot;riskLevel&quot;: &quot;HIGH&quot;, &quot;action&quot;: &quot;BLOCKED&quot;, &quot;matchedCategories&quot;: [&quot;jailbreak_bypass&quot;] {"}"}
        </div>
      </section>

      <section className="bg-brand-navy">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h2 className="text-xl font-bold text-white mb-3">Ready to see it live?</h2>
          <Link
            href="/login"
            className="inline-block px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 transition-opacity"
          >
            Sign in to the compliance console
          </Link>
        </div>
      </section>
    </>
  );
}
