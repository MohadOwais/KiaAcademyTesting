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
        hostname: 'api.kiacademy.in',
      },
    ],
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'platform-lookaside.fbsbx.com',
      's.gravatar.com',
      'graph.facebook.com'
    ],
  },
  // Set the distDir to 'build' for the output directory
  distDir: 'build',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    // Removed serverComponents as it's not valid in this Next.js version
  },
};

module.exports = nextConfig;
