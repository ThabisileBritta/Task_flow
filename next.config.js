/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for catching bugs early
  reactStrictMode: true,

  // API rewrites — avoids CORS in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
