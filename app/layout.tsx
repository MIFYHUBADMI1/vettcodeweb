import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VettCode - AI-Power At your finger tips',
  description: 'Upload your VettCode scan results and get AI-powered security explanations',
  keywords: ['security', 'code analysis', 'vulnerability scanner', 'AI', 'developer tools'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
