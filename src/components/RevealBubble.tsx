"use client";

import { useEffect, useState } from "react";

/**
 * Shows a typing-dots placeholder, then reveals the real bubble content —
 * used for a message that was just created server-side (e.g. the AI's
 * reply right after a parent flags something) so it reads as "arriving"
 * after the AI actually took a moment to respond, not instantly.
 */
export function RevealBubble({ children, className }: { children: string; className: string }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Base "thinking" time plus a per-character typing estimate, so a
    // longer reply takes a bit longer to arrive — capped so it never drags.
    const delay = Math.min(2600 + children.length * 22, 4800);
    const t = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!revealed) {
    return (
      <div className={className}>
        <span className="typing-dots">
          <span />
          <span />
          <span />
        </span>
      </div>
    );
  }

  return <div className={`${className} msg-reveal`}>{children}</div>;
}
