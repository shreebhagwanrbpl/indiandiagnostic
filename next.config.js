/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongodb"],
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
