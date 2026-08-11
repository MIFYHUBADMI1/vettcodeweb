'use client'

import { useState } from 'react'
import UploadZone from '@/components/UploadZone'
import Dashboard from '@/components/Dashboard'
import { ScanResult } from '@/lib/types'

export default function Home() {
  const [scanData, setScanData] = useState<ScanResult | null>(null)

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="gradient-bg text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">VettCode Dashboard</h1>
          <p className="text-xl opacity-90">AI-Powered Security Analysis</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!scanData ? (
          <UploadZone onUpload={setScanData} />
        ) : (
          <Dashboard scanData={scanData} onReset={() => setScanData(null)} />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-75">
            VettCode © 2024 - Security Coach for Developers
          </p>
          <p className="text-xs opacity-50 mt-2">
            Powered by AI • Built with Next.js • Deployed on Vercel
          </p>
        </div>
      </footer>
    </main>
  )
}
