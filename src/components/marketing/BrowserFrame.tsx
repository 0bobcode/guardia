export function BrowserFrame({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl overflow-hidden border border-white/10 bg-[#0b0f1c] shadow-2xl shadow-black/40 ${className ?? ""}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <span className="ml-2 text-[11px] text-slate-400 font-mono">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
