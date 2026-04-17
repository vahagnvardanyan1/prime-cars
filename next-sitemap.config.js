/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://primecars.am",
  generateRobotsTxt: false,
  generateIndexSitemap: true,
  changefreq: "weekly",
  priority: 0.7,
  exclude: [
    "/*/admin",
    "/*/admin/*",
    "/api/*",
  ],
  additionalPaths: async () => {
    const locales = ["hy", "en", "ru"];
    const routes = [
      { path: "", changefreq: "daily", priority: 1.0 },
      { path: "/cars", changefreq: "daily", priority: 0.9 },
      { path: "/calculator", changefreq: "weekly", priority: 0.8 },
      { path: "/partners", changefreq: "weekly", priority: 0.7 },
      { path: "/apply", changefreq: "monthly", priority: 0.6 },
    ];

    const paths = [];
    for (const route of routes) {
      for (const locale of locales) {
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
