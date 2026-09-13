import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import ToastProvider from '@/components/ToastProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://atai.ink'),
  title: {
    default: 'ATAI — AI Infrastructure, Applications & Developer Technology',
    template: '%s | ATAI',
  },
  description:
    'ATAI builds AI-powered applications, developer technologies, security tools, and intelligent infrastructure for the next generation of software. Explore MirrorSite AI, VettCode, and the ATAI ecosystem.',
  keywords: [
    'ATAI',
    'ATAI Enterprises',
    'Advanced Technologies and AI Enterprises',
    'AI infrastructure',
    'AI applications',
    'developer technology',
    'MirrorSite AI',
    'VettCode',
    'AI-powered development',
    'code security',
    'developer tools',
    'intelligent infrastructure',
    'security scanning',
    'application builder',
    'AI coding assistant',
  ],
  authors: [{ name: 'ATAI Enterprises' }],
  creator: 'ATAI Enterprises',
  publisher: 'ATAI Enterprises',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    url: 'https://atai.ink/',
    siteName: 'ATAI',
    title: 'ATAI — AI Infrastructure, Applications & Developer Technology',
    description:
      'ATAI builds AI-powered applications, developer technologies, security tools, and intelligent infrastructure for the next generation of software.',
    locale: 'en_US',
    images: [
      {
        url: '/favicon.png',
        width: 1200,
        height: 630,
        alt: 'ATAI - AI Infrastructure and Developer Technology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATAI — AI Infrastructure, Applications & Developer Technology',
    description:
      'ATAI builds AI-powered applications, developer technologies, security tools, and intelligent infrastructure for the next generation of software.',
    images: ['/favicon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'fVuc4AOfzEAxCg2a5vgQ967z_AGcs2MbUn6QUjl70b4',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for AI crawlers and bots */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* AI-specific meta tags */}
        <meta name="AI:context" content="ATAI is an AI technology company building application development tools (MirrorSite AI), code security tools (VettCode), and intelligent infrastructure. The ecosystem helps developers build faster with AI, secure their code, and deploy confidently." />
        <meta name="AI:category" content="Software Development, AI Tools, Security, Infrastructure" />
        <meta name="AI:tags" content="AI development, code security, developer tools, application builder, vulnerability scanning" />
      </head>
      <body className="bg-gray-50">
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  )
}
