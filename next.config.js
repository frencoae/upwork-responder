// next.config.js - COMPLETE UPDATE
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['localhost', '192.168.1.72'] // APNA IP ADD KAREIN
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'pg'],
  },
  // ✅ NETWORK ACCESS KE LIYE YE ADD KAREIN
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  }
}

module.exports = nextConfig