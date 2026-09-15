/** Mirrors the web app's --app-* / --brand-* tokens (src/app/globals.css)
 *  so the companion app reads as the same product, not a different one. */
export const colors = {
  background: '#090c14',
  surface: '#10152a',
  surface2: '#171d33',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text: '#f1f5f9',
  muted: '#94a3b8',
  faint: '#64748b',
  teal: '#2dd4bf',
  tealOn: '#04211d',
  tealSoft: 'rgba(45,212,191,0.12)',
  riskHigh: '#f87171',
  riskMed: '#fbbf24',
  riskLow: '#60a5fa',
  riskNone: '#4ade80',
} as const;

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16 } as const;
