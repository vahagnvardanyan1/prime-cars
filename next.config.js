/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig);


