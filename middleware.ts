import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./src/i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: ["/", "/(en|ru|hy)/:path*", "/((?!api|_next|.*\\..*).*)"],
};


