import Link from "next/link";
import { Logo } from "@/components/Logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-brand-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Logo size={26} />
            <span className="font-semibold text-brand-ink text-sm">GUARDIA</span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            Protecting children in the age of AI. A Campus Consortium Foundation initiative.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-ink uppercase tracking-wide mb-3">Product</p>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li><Link href="/products/guardrail" className="hover:text-brand-ink">GuardRail</Link></li>
            <li><Link href="/products/trusted" className="hover:text-brand-ink">TrustEd</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-ink uppercase tracking-wide mb-3">Company</p>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li><Link href="/about" className="hover:text-brand-ink">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand-ink">Contact</Link></li>
            <li><Link href="/login" className="hover:text-brand-ink">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-ink uppercase tracking-wide mb-3">Contact</p>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li>hello@guardia.ai</li>
            <li>guardia.ai</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-border">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-brand-muted flex flex-wrap items-center justify-between gap-2">
          <span>© 2026 Guardia · A Campus Consortium Foundation initiative</span>
          <span>Demo environment</span>
        </div>
      </div>
    </footer>
  );
}
