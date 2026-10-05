/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["node:sqlite"],
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        sqlite: false,
        "node:sqlite": false,
        "node:fs": false,
        "node:path": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
