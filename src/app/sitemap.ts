import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { fetchAllAvailableCars } from "@/lib/cars/fetchCars";
import { SITE_URL, buildLanguageAlternates } from "@/lib/seo";
import { carDetailPath } from "@/lib/seo/slug";

// Regenerate at most once an hour — car inventory changes frequently but
// it isn't worth hitting the backend on every request.
export const revalidate = 3600;

type Priority = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;
type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

// Captured once at module-load (≈ build time). Using this constant instead
// of `new Date()` per request keeps the lastModified of static marketing
// pages stable across revalidations — otherwise every rebuild would tell
// Google "all pages changed today" and trigger needless recrawls of copy
// that didn't actually change.
const BUILD_LAST_MODIFIED = new Date();

// Middleware runs with `localePrefix: "always"`, so every sitemap URL carries
// its locale prefix — including Armenian (the default).
const localeUrlFor = (path: string, locale: string) => {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${locale}${clean}`;
};

// Expand a single logical path into three URLs (one per locale) + x-default
// alternates. Using `alternates.languages` hints each URL's language to Google.
const expand = (
  path: string,
  opts: { priority: Priority; changeFrequency: ChangeFreq; lastModified?: Date },
): MetadataRoute.Sitemap => {
  const alternates = buildLanguageAlternates(path);
  return locales.map((locale) => ({
    url: localeUrlFor(path, locale),
    lastModified: opts.lastModified ?? BUILD_LAST_MODIFIED,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages: alternates },
  }));
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const staticEntries: MetadataRoute.Sitemap = [
    // Home changes often (new inventory rolls into the carousel) so we
    // intentionally bump its lastModified on every revalidation.
    ...expand("/", {
      priority: 1.0,
      changeFrequency: "daily",
      lastModified: new Date(),
    }),
    // /cars listing content also reflects live inventory.
    ...expand("/cars", {
      priority: 0.9,
      changeFrequency: "daily",
      lastModified: new Date(),
    }),
    // Marketing pages change rarely — use the build timestamp so crawlers
    // don't re-fetch them on every sitemap refresh.
    ...expand("/calculator", { priority: 0.8, changeFrequency: "weekly" }),
    ...expand("/partners", { priority: 0.6, changeFrequency: "monthly" }),
    ...expand("/apply", { priority: 0.5, changeFrequency: "monthly" }),
  ];

  // Best-effort: if the backend is unreachable we still emit static routes so
  // the sitemap is never empty.
  let carEntries: MetadataRoute.Sitemap = [];
  try {
    const { success, cars } = await fetchAllAvailableCars();
    if (success) {
      carEntries = cars.flatMap((car) =>
        // Per-car lastModified: the current Car type doesn't expose an
        // updatedAt field, so we use the revalidation time. When the backend
        // starts exposing car.updatedAt, wire it through here to avoid
        // announcing cars as "changed" on every hourly rebuild.
        expand(carDetailPath(car.id, car.year, car.brand, car.model), {
          priority: 0.8,
          changeFrequency: "weekly",
          lastModified: new Date(),
        }),
      );
    }
  } catch (error) {
    console.error("sitemap: failed to fetch cars", error);
  }

  return [...staticEntries, ...carEntries];
};

export default sitemap;
