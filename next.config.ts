import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16
  experimental: {
    // any experimental features
  }
};

export default isDev ? nextConfig : withPWA(nextConfig);
