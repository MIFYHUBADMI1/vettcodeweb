import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/api/',
          '/auth/',
          '/signin',
          '/signup',
          '/cli/',
          '/debug/',
          '/setup/',
          '/test-plan-components/',
        ],
      },
    ],
    sitemap: 'https://atai.ink/sitemap.xml',
  }
}
