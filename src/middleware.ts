import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./i18n/config";

/**
 * Middleware configuration for handling internationalization and routing.
 * This configuration ensures that the application supports multiple locales
 * and properly routes requests to the correct locale paths.
 */
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: false,
});

/**
 * Configuration for route matching.
 * The matcher array defines which paths should be processed by this middleware.
 * - The root path and locale-prefixed paths are included.
 * - The '/test-1' route is explicitly added to ensure it is handled correctly.
 * - Excludes API routes, Next.js internal paths, and static files.
 */
export const config = {
  matcher: [
    "/", 
    "/(en|ru|hy)/:path*", 
    "/test-1",
    "/((?!api|_next|_vercel|.*\\..*).*)"
  ],
};
