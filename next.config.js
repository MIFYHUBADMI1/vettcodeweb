/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ik.imagekit.io'],
  },
  env: {
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  },
  async rewrites() {
    return [
      {
        source: '/dashboard/vibe',
        destination: 'https://mirrorsite.atai.ink/dashboard',
      },
      {
        source: '/dashboard/vibe/:path*',
        destination: 'https://mirrorsite.atai.ink/:path*',
      },
    ]
  },
}

module.exports = nextConfig
