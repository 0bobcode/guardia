"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function Toast({ paramKey, message }: { paramKey: string; message: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!searchParams.get(paramKey)) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      const params = new URLSearchParams(searchParams.toString());
      params.delete(paramKey);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get(paramKey)]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg app-card px-4 py-3 text-sm font-medium text-app-text shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#2dd4bf" />
        <path d="M4.5 8.2l2.2 2.2 4.8-5" stroke="#04211d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  );
}
