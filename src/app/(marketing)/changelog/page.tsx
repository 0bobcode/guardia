import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Guardia",
  description: "What's shipped, in order. Pulled from real commit history, not a marketing summary.",
};

const RELEASES = [
  {
    date: "2026-09-29",
    items: ["Trustpilot domain verification", "Guardia Parent phone preview, real product logos, honest marketing copy"],
  },
  {
    date: "2026-09-28",
    items: [
      "Documented the browser extension's data practices in the privacy policy",
      "Fixed a student-message drop and ChatGPT signed-in DOM detection bug",
      "Added ChatGPT web monitoring to the browser extension",
    ],
  },
  { date: "2026-09-25", items: ["Fixed horizontal overflow on narrow (320px) screens"] },
  {
    date: "2026-09-24",
    items: [
      "Fixed a Vercel build break caused by standalone output mode",
      "Added Docker support and documented dependencies",
      "Removed the demo-login shortcuts from production",
      "Added district-approved OS releases; fixed a version-corruption bug",
      "Added \"Ask Guardia\" natural-language briefs on a rule-based writer (no external model call)",
      "Moved the browser-extension unpair password server-side, managed from TrustEd",
      "Parents can now delete a session from TrustEd",
    ],
  },
  { date: "2026-09-23", items: ["Added the browser extension for Gemini web monitoring"] },
  {
    date: "2026-09-22",
    items: [
      "Fixed false message capture from Gemini's input-field hint text",
      "Fixed a TypeScript build error and a scope leak into the mobile companion build",
      "Recognized Gemini's consolidated Android package for device monitoring",
    ],
  },
  { date: "2026-09-15", items: ["Added the React Native companion app (bare CLI, iOS + Android)"] },
  {
    date: "2026-09-14",
    items: ["Fixed Play Store submission blockers in the Android companion app", "Added a usage-minutes endpoint and iOS Screen Time companion"],
  },
  {
    date: "2026-09-10",
    items: [
      "District admins can add and remove custom policy categories",
      "Added a student filter to GuardRail Alerts",
      "Added Microsoft Entra ID SSO login and hardened auth/API security",
    ],
  },
  { date: "2026-09-03", items: ["Added device-monitor pairing API and the Android companion app scaffold", "Built Guardia: the GuardRail compliance API and TrustEd parental dashboard"] },
  { date: "2026-08-28", items: ["Initial project scaffold"] },
];

export default function ChangelogPage() {
  return (
    <div className="bg-brand-navy text-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">Changelog</p>
        <h1 className="text-3xl font-bold tracking-tight mb-4">What&apos;s shipped, in order.</h1>
        <p className="text-sm text-slate-400 mb-12 max-w-xl">
          Pulled from real commit history, grouped by day. Not a curated marketing highlight reel.
        </p>

        <div className="space-y-10">
          {RELEASES.map((r) => (
            <div key={r.date} className="relative pl-6 border-l border-white/10">
              <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-brand-teal" />
              <p className="text-xs font-mono text-slate-500 mb-2">{r.date}</p>
              <ul className="space-y-1.5">
                {r.items.map((item) => (
                  <li key={item} className="text-sm text-slate-300 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
