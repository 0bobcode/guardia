import Link from "next/link";
import { Logo } from "@/components/Logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-navy">
      <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Logo size={26} />
            <span className="font-semibold text-white text-sm">GUARDIA</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Protecting children in the age of AI. A Campus Consortium Foundation initiative.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-white uppercase tracking-wide mb-3">Product</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/products/guardrail" className="hover:text-white">GuardRail</Link></li>
            <li><Link href="/products/trusted" className="hover:text-white">TrustEd</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-white uppercase tracking-wide mb-3">Company</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
            <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-white uppercase tracking-wide mb-3">Contact</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>hello@guardia.ai</li>
            <li>guardia.ai</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>© 2026 Guardia · A Campus Consortium Foundation initiative</span>
          <span>Demo environment</span>
        </div>
      </div>
    </footer>
  );
}
