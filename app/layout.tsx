import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import ToastProvider from '@/components/ToastProvider'

export const metadata: Metadata = {
  title: 'VettCode - Build. Secure. Ship.',
  description: 'One ecosystem for turning ideas into real software. From your first prompt to production, VettCode gives you the tools to create, code, test, secure, and deploy applications.',
  keywords: ['VettCode', 'AI development', 'security analysis', 'code deployment', 'developer tools', 'application building', 'code security', 'web hosting', 'AI coding agent'],
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
