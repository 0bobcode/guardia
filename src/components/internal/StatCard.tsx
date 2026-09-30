export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export function EmptyStateCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{body}</p>
    </div>
  );
}
