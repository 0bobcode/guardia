"use client";

import { useEffect, useState } from "react";

/** A thin gradient bar pinned to the very top of the viewport that fills
 *  as the visitor scrolls — like Rolli's page-progress meter. Pure scroll
 *  listener, rAF-throttled, no layout dependency on section IDs. */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let ticking = false;

    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const p = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      setPct(Math.min(100, Math.max(0, p)));
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none bg-white/5"
    >
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, #2dd4bf, #818cf8, #f59e0b)",
          backgroundSize: "200% 100%",
          backgroundPosition: `${100 - pct}% 0`,
          boxShadow: pct > 1 ? "0 0 10px rgba(45, 212, 191, 0.7), 0 0 4px rgba(245, 158, 11, 0.5)" : "none",
          transition: "width 80ms linear",
        }}
      />
    </div>
  );
}
