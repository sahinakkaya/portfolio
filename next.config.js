/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production for smaller build size
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  swcMinify: true,

  // Compiler optimizations
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [],
  },

  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Output configuration
  output: 'standalone',

  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Requires critters package
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
