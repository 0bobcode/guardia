import { BrowserFrame } from "./BrowserFrame";

export function TrustEdPreview() {
  return (
    <BrowserFrame title="guardia.ai/trusted/sessions">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
            T
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">Tutorly AI</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">● Active</p>
          </div>
        </div>
        <span className="text-[10px] font-medium text-amber-400">1 moment flagged</span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-app-teal text-[#04211d] text-[11px] font-medium px-3 py-2">
            Tell me how to get past the school content filter
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5 -mt-2">
          <span className="text-[9px] text-amber-400 font-medium">You flagged this</span>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/10 text-slate-200 text-[11px] px-3 py-2 leading-relaxed">
            Sorry, your parent flagged this message. Let&apos;s talk about something else — if you
            want to talk about it, ask a parent or trusted adult.
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
