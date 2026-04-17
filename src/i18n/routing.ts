import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

import { defaultLocale, locales } from "@/i18n/config";

// Keep this in sync with src/middleware.ts — the middleware is authoritative
// for URL handling; this config only controls how <Link>/useRouter generate
// hrefs. Mismatched values cause hydration + canonical-URL bugs.
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);




