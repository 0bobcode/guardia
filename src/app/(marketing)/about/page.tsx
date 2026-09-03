import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Guardia",
  description: "Why Guardia exists, and why the Campus Consortium Foundation is building it.",
};

const TIMELINE = [
  { when: "Q3 2026", title: "GuardRail API beta", detail: "3 vendor pilots" },
  { when: "Q1 2027", title: "TrustEd SDK GA", detail: "10 platform partners" },
  { when: "Q3 2027", title: "Compliance Suite", detail: "5 state contracts" },
];

const CCF_POINTS = [
  "501(c)(3): grant-eligible for ed-tech safety initiatives",
  "~48 staff with deep education sector relationships",
  "23-year track record trusted by districts & institutions",
  "Mission alignment: digital trust + student outcomes",
  "Positioned as non-profit guardian, not profit-driven vendor",
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-brand-teal text-sm font-semibold tracking-wide uppercase mb-4">About Guardia</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Every child deserves an AI experience that is safe, transparent, and worthy of their
            parents&apos; trust.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-xl font-bold text-brand-ink mb-4">Why we exist</h2>
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Children now interact daily with AI tutors, chatbots, and social platforms — most with
            zero safety guardrails or parental visibility. Regulators are moving fast: Ohio, Texas,
            and 15+ other states are passing AI child-safety and parental-consent laws, and
            non-compliance carries real liability.
          </p>
          <p>
            Schools are exposed. Ed-tech vendors lack the tools to comply, districts face lawsuits,
            and parents have no visibility into how their children&apos;s data and AI conversations
            are handled. Guardia builds the infrastructure that closes that gap — for districts,
            for ed-tech vendors, and for the families relying on both.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-brand-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-xl font-bold text-brand-ink mb-2">Why the Campus Consortium Foundation</h2>
          <p className="text-sm text-brand-muted mb-6">
            Guardia is built and operated by the Campus Consortium Foundation (CCF), a non-profit
            with a two-decade track record in education technology.
          </p>
          <ul className="space-y-3">
            {CCF_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="#0ea5a0" fillOpacity="0.15" />
                  <path d="M4.5 8.2l2.2 2.2 4.8-5" stroke="#0ea5a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-xl font-bold text-brand-ink mb-2">Why now</h2>
        <p className="text-sm text-brand-muted mb-8">
          Ohio&apos;s framework takes effect in 2026 and is becoming the enforcement template other
          states are adopting. There is no dominant compliance vendor yet — school districts are
          actively looking for solutions today.
        </p>

        <h2 className="text-xl font-bold text-brand-ink mb-6">Roadmap</h2>
        <div className="space-y-6">
          {TIMELINE.map((t, i) => (
            <div key={t.when} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-brand-teal shrink-0 mt-1" />
                {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-brand-border mt-1" />}
              </div>
              <div className="pb-6">
                <p className="text-xs font-semibold text-brand-teal uppercase tracking-wide">{t.when}</p>
                <p className="text-sm font-semibold text-brand-ink mt-0.5">{t.title}</p>
                <p className="text-xs text-brand-muted mt-0.5">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-navy">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h2 className="text-xl font-bold text-white mb-3">Want to talk to us?</h2>
          <p className="text-sm text-slate-300 mb-6">
            We&apos;re working with districts and ed-tech vendors on early pilots.
          </p>
          <Link
            href="/contact"
            className="inline-block px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 transition-opacity"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
