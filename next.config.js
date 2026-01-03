/** @type {import('next').NextConfig} */
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

module.exports = nextConfig;


