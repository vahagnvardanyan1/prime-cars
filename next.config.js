/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

const nextConfig = {
  images: {
    domains: ["crheiatdcgohvxngusnj.storage.supabase.co"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "coordinated-taco-gvu1ledv.storage.railway.app" },
      { protocol: "https", hostname: "crheiatdcgohvxngusnj.storage.supabase.co" },
    ],
  },
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig);

