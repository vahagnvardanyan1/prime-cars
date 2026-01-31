/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "coordinated-taco-gvu1ledv.storage.railway.app" },
      { protocol: "https", hostname: "storage.railway.app", pathname: "/embedded-cabinet-2pnyxqnq/**" },
    ],
  },
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig);

