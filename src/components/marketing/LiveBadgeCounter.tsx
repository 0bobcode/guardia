"use client";

import { useEffect, useState } from "react";

export function LiveBadgeCounter() {
  const [count, setCount] = useState(2104812);

  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 9) + 1);
    }, 1400);
    return () => clearInterval(t);
  }, []);

  return <>{(count / 1_000_000).toFixed(2)}M+ AI interactions scanned today</>;
}
