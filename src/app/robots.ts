import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*/admin/", "/admin/"],
    },
    // Block known AI training crawlers — site content is business copy and
    // vehicle listings, no benefit to us from bulk scraping.
    { userAgent: "CCBot", disallow: "/" },
    { userAgent: "GPTBot", disallow: "/" },
    { userAgent: "Google-Extended", disallow: "/" },
    { userAgent: "anthropic-ai", disallow: "/" },
    { userAgent: "ClaudeBot", disallow: "/" },
    { userAgent: "PerplexityBot", disallow: "/" },
  ],
  sitemap: `${SITE_URL}/sitemap.xml`,
  host: SITE_URL,
});

export default robots;
