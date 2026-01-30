/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve Fast Refresh reliability
  reactStrictMode: true,

  // Increase timeouts for development
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Webpack optimizations for faster HMR
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Improve Fast Refresh
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
