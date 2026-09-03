import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TrustEd — Guardia",
  description: "Parental Controls SDK for schools and ed-tech.",
};

export default function TrustedPage() {
  return (
    <>
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="text-brand-teal text-sm font-semibold tracking-wide uppercase mb-4">
            Parental Controls SDK
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
            One dashboard for every AI app your child uses at school.
          </h1>
          <p className="mt-5 text-slate-300 max-w-xl">
            TrustEd gives parents real-time visibility and consent controls, and gives schools and
            ed-tech vendors a drop-in SDK that makes COPPA and state compliance automatic.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 transition-opacity"
            >
              Sign in to your dashboard
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

      <section className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-4">
            For schools &amp; ed-tech vendors
          </p>
          <ul className="space-y-3">
            {[
              "Drop-in SDK: embed in any LMS or app in days",
              "Automatic parental consent workflows",
              "Weekly usage digests sent to parents",
              "COPPA & state compliance out-of-the-box",
              "Fully white-labeled as your product",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3 3 7-7" stroke="#0ea5a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-4">
            For parents
          </p>
          <ul className="space-y-3">
            {[
              "One dashboard: all ed apps, one view",
              "Consent approvals in real time",
              "Real-time alerts on flagged AI content",
              "Time & subject-area controls",
              "No tech skills required",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3 3 7-7" stroke="#0ea5a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-brand-border">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-brand-ink mb-3">Built for non-technical districts</h2>
          <p className="text-sm text-brand-muted max-w-lg mx-auto">
            No engineering team required. Ed-tech vendors embed the SDK once; parents get consent
            requests, usage summaries, and safety alerts automatically — with zero setup on their
            end.
          </p>
        </div>
      </section>

      <section className="bg-brand-navy">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h2 className="text-xl font-bold text-white mb-3">See the parent experience</h2>
          <Link
            href="/login"
            className="inline-block px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 transition-opacity"
          >
            Sign in to TrustEd
          </Link>
        </div>
      </section>
    </>
  );
}
