/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
