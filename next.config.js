/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000'
  },
  images: {
    // Enable image optimization
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
}

module.exports = nextConfig
