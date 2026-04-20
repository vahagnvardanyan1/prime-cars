const LOCALES = ["hy", "en", "ru"];

const ROUTES = [
  { path: "", changefreq: "daily", priority: 1.0 },
  { path: "/cars", changefreq: "daily", priority: 0.9 },
  { path: "/calculator", changefreq: "weekly", priority: 0.8 },
  { path: "/partners", changefreq: "weekly", priority: 0.7 },
  { path: "/apply", changefreq: "monthly", priority: 0.6 },
];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://primecars.am",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/*/admin", "/*/admin/*", "/api/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/*/admin/", "/admin/"] },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "PerplexityBot", disallow: "/" },
    ],
  },
  additionalPaths: async () => {
    const paths = [];
    for (const route of ROUTES) {
      for (const locale of LOCALES) {
        paths.push({
          loc: `/${locale}${route.path}`,
          changefreq: route.changefreq,
          priority: route.priority,
          lastmod: new Date().toISOString(),
        });
      }
    }
    return paths;
  },
};
