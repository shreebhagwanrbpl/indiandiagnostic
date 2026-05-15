/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,

  experimental: {
    turbo: {
      resolveAlias: {},
    },
  },
};

module.exports = nextConfig;