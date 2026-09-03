"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function JumpToMessage() {
  const searchParams = useSearchParams();
  const jumpId = searchParams.get("jump");

  useEffect(() => {
    if (!jumpId) return;
    const el = document.getElementById(`msg-${jumpId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("msg-highlight");
    const t = setTimeout(() => el.classList.remove("msg-highlight"), 2200);
    return () => clearTimeout(t);
  }, [jumpId]);

  return null;
}
