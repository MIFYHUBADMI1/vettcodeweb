import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/auth/*',
          '/cli/*',
          '/debug/*',
          '/setup/*',
          '/test-plan-components/*',
        ],
      },
      // Special rules for AI crawlers and bots
      {
        userAgent: [
          'GPTBot',          // OpenAI
          'ChatGPT-User',    // ChatGPT
          'Google-Extended', // Google Bard/Gemini
          'anthropic-ai',    // Claude
          'Claude-Web',      // Claude web crawler
          'CCBot',           // Common Crawl (used by many AI)
          'PerplexityBot',   // Perplexity AI
          'Applebot-Extended', // Apple Intelligence
        ],
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/auth/*',
          '/cli/*',
          '/debug/*',
          '/setup/*',
        ],
        crawlDelay: 1, // Be nice to AI crawlers
      },
      // Google-specific
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/auth/*',
          '/cli/*',
          '/debug/*',
          '/setup/*',
        ],
      },
    ],
    sitemap: 'https://atai.ink/sitemap.xml',
    host: 'https://atai.ink',
  }
}
