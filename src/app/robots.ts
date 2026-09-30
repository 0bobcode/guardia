import type { MetadataRoute } from "next";

// /internal (the staff-only dashboards) is already gated by an email
// allowlist server-side — this just keeps it out of search-engine crawls
// and results, on top of that real auth gate, not instead of it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/internal", "/internal/", "/api", "/trusted", "/guardrail"],
    },
  };
}
