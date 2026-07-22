/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pre-existing lint debt (mostly no-explicit-any) — keep CI `pnpm lint` for visibility.
  // Blocking Vercel production builds on it is not practical until types are cleaned up.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
};

module.exports = nextConfig;
