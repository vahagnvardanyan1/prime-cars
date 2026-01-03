/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn-editing-temp.picsart.com" },
      { protocol: "https", hostname: "cdn-cms-uploads.picsart.com" },
    ],
  },
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig);


