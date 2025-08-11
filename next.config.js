/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PHONE_PAY_HOST_URL: process.env.NEXT_PUBLIC_PHONE_PAY_HOST_URL,
    NEXT_PUBLIC_MERCHANT_ID: process.env.NEXT_PUBLIC_MERCHANT_ID,
    NEXT_PUBLIC_SALT_KEY: process.env.NEXT_PUBLIC_SALT_KEY,
    NEXT_PUBLIC_SALT_INDEX: process.env.NEXT_PUBLIC_SALT_INDEX,
    NEXT_URL: process.env.NEXT_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.kiacademy.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
      {
        protocol: 'https',
        hostname: 'google.com',
      },
    ],
  },
  distDir: 'build',
  webpack: (config) => {
    // Keep default Next.js optimization
    return config;
  },
};

module.exports = nextConfig;
