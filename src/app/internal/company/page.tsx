const PRODUCTS = [
  {
    name: "GuardRail",
    tagline: "AI Safety Compliance API",
    body: "A REST endpoint that sits between any AI application and the student using it. Every message is scored against a grade-band policy (K-5 / 6-8 / 9-12) in real time — blocked, flagged, or passed — and every scan is logged for audit. Sold to districts and to the ed-tech vendors building the AI tools those districts use.",
  },
  {
    name: "TrustEd",
    tagline: "Parental Controls Dashboard",
    body: "The parent- and district-facing surface for everything GuardRail catches. Parents get one dashboard across every AI app their child uses at school, real-time alerts on flagged content, and consent controls. District admins get the compliance/audit view regulators ask for.",
  },
  {
    name: "Guardia",
    tagline: "The company / parent brand",
    body: "Guardia is the umbrella brand for GuardRail + TrustEd, plus companion surfaces: a browser extension that monitors AI web apps (Gemini, ChatGPT) directly, and mobile companion apps (iOS Screen Time integration, Android) for usage-minutes tracking outside the browser.",
  },
];

const COMPETITORS = [
  {
    name: "Bark",
    category: "Parental monitoring / school safety",
    note: "Monitors text, email, and social activity for risk signals; strong consumer parent brand plus a schools product (Bark for Schools). Broader surface area (social media, texts) than Guardia's AI-specific focus.",
  },
  {
    name: "Gaggle",
    category: "Student safety / content monitoring",
    note: "Long-established in K-12, monitors Google Workspace / Microsoft 365 content with human review layered on automated detection. Positioned on human-in-the-loop review, which GuardRail does not currently offer.",
  },
  {
    name: "Securly",
    category: "Web filtering + student wellness",
    note: "Web filtering plus a wellness/safety layer (Securly Aware) across district devices. Device- and network-level filtering, not an API that sits inside a third-party AI app's request path like GuardRail.",
  },
  {
    name: "GoGuardian",
    category: "Classroom management + web filtering",
    note: "Strong classroom-management and device-filtering incumbent. Large existing district footprint is the main competitive risk if they add an AI-content-scanning feature.",
  },
  {
    name: "Qustodio / Life360",
    category: "Consumer parental controls",
    note: "Consumer-first, device- and app-usage-level controls. Not school/compliance-focused and don't inspect AI conversation content — adjacent, not a direct competitor for the district/compliance sale.",
  },
  {
    name: "Lightspeed Systems / ContentKeeper",
    category: "Web filtering / network security",
    note: "Network-layer filtering vendors already inside many district budgets. A likely bundling threat if they ship an AI-scanning add-on — worth tracking their release notes.",
  },
];

const ROADMAP = [
  {
    phase: "Now",
    items: [
      "Real interactive GuardRail demo live on the marketing site",
      "Browser extension (Gemini, ChatGPT web) shipped for monitoring",
      "iOS Screen Time + Android companion apps for usage tracking",
      "Microsoft Entra ID SSO for district login",
    ],
  },
  {
    phase: "Next",
    items: [
      "CRM integration (sales pipeline is currently just signed-district counts — see Sales dashboard)",
      "Analytics integration (GA4/PostHog) — marketing has zero visit/funnel data today",
      "Human-review queue for HIGH-risk flags, addressing the Gaggle-style review gap",
      "Expand browser-extension coverage beyond Gemini/ChatGPT to more AI web apps",
    ],
  },
  {
    phase: "Later",
    items: [
      "State-specific compliance report templates beyond Ohio/TX",
      "District self-serve policy marketplace (shareable custom policy categories)",
      "SOC 2 Type II, given the compliance-buyer audience",
    ],
  },
];

export default function CompanyHandbookPage() {
  return (
    <div className="space-y-12">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-1">Founder / Exec handbook</p>
        <h1 className="text-2xl font-bold">Everything a new founder, super admin, or CEO needs on day one.</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          This page is a living reference, not a pitch deck — it should get corrected as facts change.
          The competitor notes are qualitative/directional; they haven&apos;t been verified against
          each vendor&apos;s current pricing or contracts.
        </p>
      </div>

      {/* One-pager */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">One-pager</h2>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <span className="font-semibold text-white">Problem — </span>
            Schools are rolling out AI tutoring/chat tools faster than they can vet them. A student
            can get an unsafe reply from an AI app, and today there&apos;s no consistent way for a
            district to detect it, block it, or show a parent or regulator what happened.
          </p>
          <p>
            <span className="font-semibold text-white">Solution — </span>
            GuardRail is a REST API any AI app calls before returning a response — it scores the
            content against a grade-band policy and blocks/flags unsafe output. TrustEd turns every
            flagged event into something a parent can actually read and act on, and an audit trail a
            regulator can review.
          </p>
          <p>
            <span className="font-semibold text-white">Market — </span>
            K-12 districts (56M+ students in the US¹) and the ed-tech vendors building AI tools for
            them, in a regulatory environment where 15+ states are actively legislating AI/child
            online safety².
          </p>
          <p>
            <span className="font-semibold text-white">Business model — </span>
            API usage / seat-based pricing to districts and ed-tech vendors (no public price list yet
            — see Sales dashboard; pricing conversations currently happen case-by-case).
          </p>
          <p className="text-[11px] text-slate-500 pt-2 border-t border-white/10">
            ¹ National Center for Education Statistics. ² Based on public legislative tracking.
          </p>
        </div>
      </section>

      {/* Products */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Product descriptions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-base font-bold text-white">{p.name}</h3>
              <p className="text-xs font-semibold text-brand-teal mt-0.5 mb-2">{p.tagline}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Competitor sheet */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Competitor sheet</h2>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.06] text-left text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Notes / how Guardia differs</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c, i) => (
                <tr key={c.name} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                  <td className="px-4 py-3 font-semibold text-white align-top whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-3 text-slate-400 align-top whitespace-nowrap">{c.category}</td>
                  <td className="px-4 py-3 text-slate-400 align-top leading-relaxed">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Roadmap */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Roadmap (draft — not committed dates)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {ROADMAP.map((r) => (
            <div key={r.phase} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-semibold text-brand-teal uppercase mb-3">{r.phase}</p>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                {r.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-slate-500">
        See also: <a href="/changelog" className="text-brand-teal hover:underline">public changelog</a>,{" "}
        <a href="/internal/admin" className="text-brand-teal hover:underline">Super Admin</a> for live production numbers.
      </p>
    </div>
  );
}
