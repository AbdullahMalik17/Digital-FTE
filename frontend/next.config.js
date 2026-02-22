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
  // Frontend uses its own Python backend (localhost:8000 by default).
  // The mobile app separately connects directly to https://abdullah-junior-api.fly.dev.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
