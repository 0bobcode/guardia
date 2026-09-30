import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GuardRailPreview } from "@/components/marketing/GuardRailPreview";
import { InteractiveScanDemo } from "@/components/marketing/InteractiveScanDemo";
import { Reveal } from "@/components/marketing/Reveal";
import { CountUp } from "@/components/marketing/CountUp";
import { AnimatedWaves } from "@/components/marketing/AnimatedWaves";
import { Particles } from "@/components/marketing/Particles";
import { RiskScoreShowcase } from "@/components/marketing/RiskScoreShowcase";
import { AskGuardiaDemo } from "@/components/marketing/AskGuardiaDemo";
import { Faq } from "@/components/marketing/Faq";
import { IconAlert, IconPolicies, IconReports, IconChat, IconCheck, IconClock } from "@/components/icons";
import { CATEGORY_DEFS } from "@/lib/scanEngine";

const FEATURES = [
  {
    Icon: IconAlert,
    title: "Real-time detection",
    body: "Every message is scored before it reaches a child — not sampled afterward.",
  },
  {
    Icon: IconPolicies,
    title: "Age-tiered policies",
    body: "K-5, 6-8, and 9-12 each get their own rules. Districts edit them live, no redeploy.",
  },
  {
    Icon: IconReports,
    title: "Audit-ready reporting",
    body: "Every scan is logged and exportable, formatted for state child-safety statutes.",
  },
  {
    Icon: IconChat,
    title: "Full session transcripts",
    body: "Parents see the whole conversation, not a single flagged line stripped of context.",
  },
  {
    Icon: IconCheck,
    title: "One-tap consent",
    body: "When an app wants a child's data, a parent approves or denies it from their phone.",
  },
  {
    Icon: IconClock,
    title: "Time & subject controls",
    body: "Per-app daily limits parents set themselves — no ticket to the district required.",
  },
];

const AUDIENCES = [
  {
    label: "Districts",
    color: "#2dd4bf",
    title: "Compliance that doesn't need a redeploy.",
    body: "Set age-tiered policies once. Edit keyword rules and actions live from GuardRail — no vendor ticket, no code change.",
    points: ["Audit-ready exports for state statutes", "One weighted risk score per district", "Microsoft Entra ID SSO support"],
  },
  {
    label: "Parents",
    color: "#818cf8",
    title: "The full conversation, not a flagged fragment.",
    body: "TrustEd shows real session transcripts, screen time, and one-tap consent requests — from your phone, in plain English.",
    points: ["Full transcripts, never a stripped line", "Ask Guardia a question in plain English", "One-tap approve or deny a data request"],
  },
  {
    label: "Ed-tech vendors",
    color: "#f59e0b",
    title: "Ship compliance without building it.",
    body: "Point your AI app at one REST endpoint. GuardRail scores every message before your model replies — no ML team required.",
    points: ["One REST endpoint, any language", "Scores content before the reply is sent", "Built to integrate in under 4 hours"],
  },
];

const TRUST_BADGES = [
  { title: "TLS in transit", body: "All traffic between apps, dashboards, and servers is encrypted." },
  { title: "Encrypted DB connection", body: "Our database connection requires SSL." },
  { title: "Rate-limited endpoints", body: "Pairing and ingestion endpoints are throttled to reduce abuse." },
  { title: "Scoped access only", body: "Only a student's linked parent and their district admins can view their data." },
];

const FAQS = [
  {
    q: "Which AI apps does Guardia actually monitor?",
    a: "Gemini, ChatGPT, and Claude. On Android, a real Accessibility Service reads on-screen text from just those three apps. On iOS, Apple's platform doesn't allow any app to read message content — so the iOS companion tracks usage time only, never what was said.",
  },
  {
    q: "Do I need to integrate GuardRail separately for every AI tool?",
    a: "No — one REST endpoint. Any AI application, any language, points traffic at GuardRail and gets a risk score back before the reply reaches a student.",
  },
  {
    q: "Who can actually see a student's data?",
    a: "Only the parent or guardian linked to that student, and authorized administrators at that student's district. Guardia doesn't sell data or use it for advertising.",
  },
  {
    q: "Does the iOS app read my child's messages?",
    a: "No. Apple's Family Controls framework doesn't permit any app — including ours — to read on-screen content on iOS, at any price tier. The iOS companion only reports usage-time thresholds.",
  },
  {
    q: "What happens when GuardRail blocks something?",
    a: "The reply never reaches the child. The attempt is logged as a scan event with its risk tier and matched category, and shows up in both the district's GuardRail alerts and the parent's TrustEd dashboard.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Point traffic at GuardRail",
    body: "One REST endpoint. Any AI app, any language. Built to integrate in under 4 hours.",
    icon: (
      <path
        d="M9 3v4M15 3v4M6 9h12l-1 10a2 2 0 01-2 2H9a2 2 0 01-2-2L6 9z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    n: "02",
    title: "Every message gets scanned",
    body: "Content is scored against the grade band's policy in real time — blocked, flagged, or passed before the child sees a reply.",
    icon: (
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    n: "03",
    title: "Parents see what happened",
    body: "TrustEd turns every flagged moment into a full transcript a parent can actually read, react to, and act on.",
    icon: (
      <path
        d="M8 14a4 4 0 118 0M12 12a3 3 0 100-6 3 3 0 000 6zM4 20c0-3 2.5-5 5-5M20 20c0-3-2.5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Home() {
  return (
    <div className="relative text-white">
      <AnimatedWaves />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-20 relative">
          <div className="load-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 mb-7">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulse" />
            Real-time scanning for Gemini, ChatGPT &amp; Claude
          </div>
          <h1
            className="load-in text-5xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-[1.05]"
            style={{ animationDelay: "70ms" }}
          >
            The safety layer between kids and <span className="gradient-text">AI</span>.
          </h1>
          <p
            className="load-in mt-6 text-lg text-slate-300 max-w-xl leading-relaxed"
            style={{ animationDelay: "140ms" }}
          >
            GuardRail scans every message before it reaches a child. TrustEd shows their parent
            exactly what happened next — so parents are never the last to find out.
          </p>
          <div className="load-in mt-10 flex flex-wrap gap-4" style={{ animationDelay: "210ms" }}>
            <Link
              href="/login"
              className="group px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 hover:shadow-xl hover:shadow-brand-teal/25 hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2"
            >
              Sign in to your dashboard
              <svg className="transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="#demo"
              className="px-5 py-3 rounded-md border border-brand-teal/40 text-brand-teal font-semibold hover:bg-brand-teal/10 hover:border-brand-teal/60 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Try the interactive demo ↓
            </Link>
            <Link
              href="/products/guardrail"
              className="px-5 py-3 rounded-md border border-white/20 text-white font-semibold hover:bg-white/5 hover:border-white/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Explore the products
            </Link>
          </div>
        </div>

        <div
          id="demo"
          className="load-in mx-auto max-w-6xl px-6 pb-28 relative grid md:grid-cols-2 gap-5 scroll-mt-24"
          style={{ animationDelay: "280ms" }}
        >
          <GuardRailPreview />
          <InteractiveScanDemo />
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <Particles count={5} />
        <div className="relative mx-auto max-w-6xl px-6 pt-10 pb-6 grid sm:grid-cols-3 gap-6 text-center sm:text-left">
          <Reveal>
            <p className="text-2xl font-bold text-white tabular-nums">
              <CountUp end={56} suffix="M+" />
            </p>
            <p className="text-xs text-slate-400 mt-1">K-12 students in the US¹</p>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-2xl font-bold text-white tabular-nums">
              <CountUp end={15} suffix="+" />
            </p>
            <p className="text-xs text-slate-400 mt-1">States actively legislating AI/child online safety²</p>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-2xl font-bold text-white tabular-nums">
              <CountUp end={4} prefix="<" suffix="h" />
            </p>
            <p className="text-xs text-slate-400 mt-1">Design target for GuardRail integration³</p>
          </Reveal>
        </div>
        <p className="mx-auto max-w-6xl px-6 pb-6 text-[11px] text-slate-500 leading-relaxed">
          ¹ National Center for Education Statistics, public + private K-12 enrollment. &nbsp; ² Based on
          public legislative tracking; changes as states introduce or pass bills. &nbsp; ³ A target
          for a single REST integration, not yet measured across live customers.
        </p>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">
              No dashboards to dig through
            </p>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              Ask Guardia a question. <span className="gradient-text">Get a real brief back.</span>
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-md">
              Parents and district admins can ask in plain English — &ldquo;Any concerning topics
              this week?&rdquo; — and Guardia reads the real, already-scanned activity and answers
              in seconds. Every number in the brief comes straight from GuardRail&apos;s logs, never
              invented.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <AskGuardiaDemo />
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-white/10 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(500px 400px at 85% 20%, rgba(45, 212, 191, 0.08), transparent)",
          }}
        />
        <Particles count={8} />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <Reveal className="max-w-xl mb-12">
            <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">How it works</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              From integration to audit trail, in three steps.
            </h2>
          </Reveal>
          <div className="relative grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120} className="relative">
                <div className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-6 transition-all hover:-translate-y-0.5 hover:border-brand-teal/30 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/30">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center text-brand-teal relative z-10 bg-brand-navy">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        {s.icon}
                      </svg>
                    </div>
                    <span className="text-xs font-mono font-semibold text-brand-teal/70 tracking-wider">
                      STEP {s.n}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(600px 460px at 90% 15%, rgba(99, 102, 241, 0.09), transparent)",
          }}
        />
        <Particles count={6} />
        <div className="relative mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">
              One score, every platform
            </p>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              See a district&apos;s real-time risk posture at a glance.
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Every scan rolls up into one weighted score and a live breakdown by severity — the
              same view a district admin sees inside GuardRail.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm">
              {[
                { label: "Risk tiers scored", value: "4" },
                { label: "Grade bands supported", value: "3" },
                { label: "Updated per", value: "scan" },
                { label: "Categories tracked", value: `${CATEGORY_DEFS.length}` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <RiskScoreShowcase />
          </Reveal>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <Reveal className="max-w-xl mb-12">
          <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">
            GuardRail + TrustEd
          </p>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Everything a district, a vendor, and a parent each actually need.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 3) * 100}>
              <div className="bg-white/[0.04] rounded-xl border border-white/10 p-6 h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 hover:border-brand-teal/30 hover:bg-white/[0.06]">
                <div className="h-10 w-10 rounded-lg bg-brand-teal/15 flex items-center justify-center text-brand-teal mb-4">
                  <Icon />
                </div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(560px 420px at 10% 80%, rgba(129, 140, 248, 0.08), transparent)",
          }}
        />
        <Particles count={5} />
        <Reveal className="relative max-w-xl mb-12">
          <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">Who it&apos;s for</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            One platform, three very different needs.
          </h2>
        </Reveal>
        <div className="relative grid md:grid-cols-3 gap-5">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.label} delay={i * 100}>
              <div
                className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 hover:bg-white/[0.05]"
                style={{ borderTopColor: a.color, borderTopWidth: 2 }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: a.color }}>
                  {a.label}
                </p>
                <h3 className="text-base font-bold text-white leading-snug">{a.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{a.body}</p>
                <ul className="mt-4 space-y-1.5">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ background: a.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <Particles count={4} />
        <div className="relative mx-auto max-w-6xl px-6 py-14">
          <Reveal className="max-w-xl mb-8">
            <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">
              Security &amp; privacy
            </p>
            <h2 className="text-2xl font-bold text-white tracking-tight">Built with real protections, not a checkbox.</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="h-full rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-brand-teal shrink-0">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm font-semibold text-white">{b.title}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Full details in our <Link href="/privacy" className="text-brand-teal hover:underline">privacy policy</Link>.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-6 py-20">
        <Reveal className="max-w-xl mb-10">
          <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">Questions</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">Before you ask, a few answers.</h2>
        </Reveal>
        <Reveal delay={80}>
          <Faq items={FAQS} />
        </Reveal>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(480px 380px at 50% 30%, rgba(45, 212, 191, 0.10), transparent)",
          }}
        />
        <Particles count={7} />
        <Reveal className="relative mx-auto max-w-6xl px-6 py-16 text-center">
          <Logo size={40} className="mx-auto mb-6" />
          <p className="text-lg text-white font-medium max-w-2xl mx-auto leading-relaxed">
            &ldquo;Every child deserves an AI experience that is safe, transparent, and worthy of
            their parents&apos; trust.&rdquo;
          </p>
          <Link
            href="/about"
            className="inline-block mt-6 text-sm font-semibold text-brand-teal hover:underline"
          >
            Learn about Guardia →
          </Link>
        </Reveal>
      </section>

      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(700px 500px at 20% 10%, rgba(45, 212, 191, 0.10), transparent), radial-gradient(600px 480px at 85% 90%, rgba(99, 102, 241, 0.10), transparent)",
          }}
        />
        <Particles count={8} />
        <Reveal className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            No dominant compliance vendor yet. That window closes fast.
          </h2>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto">
            Ohio&apos;s framework is already becoming the national template. Districts are looking
            for a solution today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 hover:shadow-xl hover:shadow-brand-teal/25 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Sign in to your dashboard
            </Link>
            <Link
              href="/contact"
              className="px-5 py-3 rounded-md border border-white/20 text-white font-semibold hover:bg-white/5 hover:border-white/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Talk to us
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
