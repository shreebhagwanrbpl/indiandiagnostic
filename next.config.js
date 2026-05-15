/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  trailingSlash: true,

  experimental: {
    turbo: {
      resolveAlias: {},
    },
  },
};

module.exports = nextConfig;