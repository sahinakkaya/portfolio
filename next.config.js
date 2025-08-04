/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [],
  },
  eslint: {
    // Disable ESLint during builds (for Docker)
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
