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
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://atai.ink/',
    siteName: 'ATAI',
    title: 'ATAI — AI Infrastructure, Applications & Developer Technology',
    description:
      'ATAI builds AI-powered applications, developer technologies, security tools, and intelligent infrastructure for the next generation of software.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATAI — AI Infrastructure, Applications & Developer Technology',
    description:
      'ATAI builds AI-powered applications, developer technologies, security tools, and intelligent infrastructure for the next generation of software.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google-site-verification': 'fVuc4AOfzEAxCg2a5vgQ967z_AGcs2MbUn6QUjl70b4',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  )
}