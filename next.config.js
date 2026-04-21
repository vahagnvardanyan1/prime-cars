/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

const nextConfig = {
  reactStrictMode: false,
  images: {
    // Modern formats trim car-photo bandwidth by ~40-60% and feed better LCP.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "t3.storageapi.dev" },
      { protocol: "https", hostname: "coordinated-taco-gvu1ledv.storage.railway.app" },
      { protocol: "https", hostname: "storage.railway.app", pathname: "/embedded-cabinet-2pnyxqnq/**" },
      { protocol: "https", hostname: "t3.storageapi.dev" },
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
      // OG images live at stable paths (/og/default.png, /og/home-*.png)
      // without a content hash in the filename. We can't safely mark them
      // immutable — if we updated the image, CDNs and browsers would serve
      // the stale version for up to a year. Use a 1-hour cache with
      // stale-while-revalidate so crawlers get freshness quickly.
      {
        source: "/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  // NOTE: no locale redirect rules here. The app uses `localePrefix: "always"`
  // in next-intl middleware, so `/hy/*` IS the canonical path for Armenian —
  // redirecting it would collide with the middleware and create a loop.
};

module.exports = withNextIntl(nextConfig);
