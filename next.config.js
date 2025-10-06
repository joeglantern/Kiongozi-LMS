/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: require('path').join(__dirname),
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://kiongozi-api.onrender.com/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
