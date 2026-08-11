'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ArrowRight, 
  Sparkles, 
  Terminal, 
  Shield, 
  Cloud,
  Home,
  Code
} from 'lucide-react'
import { useEffect } from 'react'

export default function NotFound() {
  const pathname = usePathname()

  // Sanitize pathname for display - remove sensitive query params
  const displayPath = pathname ? pathname.split('?')[0] : '/unknown'

  // Set metadata for SEO
  useEffect(() => {
    document.title = '404 - Page Not Found | VettCode'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'The page you are looking for does not exist.')
    }
    const metaRobots = document.querySelector('meta[name="robots"]')
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow')
    } else {
      const newMetaRobots = document.createElement('meta')
      newMetaRobots.name = 'robots'
      newMetaRobots.content = 'noindex, nofollow'
      document.head.appendChild(newMetaRobots)
    }
  }, [])

  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                  VettCode
                </Link>
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/products" className="text-gray-300 hover:text-white transition">Products</Link>
                  <Link href="/developers" className="text-gray-300 hover:text-white transition">Developers</Link>
                  <Link href="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
                  <Link href="/docs" className="text-gray-300 hover:text-white transition">Docs</Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/signin" className="text-gray-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold transition"
                >
                  Start Building
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="container mx-auto relative">
            <div className="max-w-4xl mx-auto">
              {/* Visual Concept - Broken Development Path */}
              <div className="mb-12">
                <div className="flex flex-col items-center gap-2 md:gap-3">
                  {/* Top Path */}
                  <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                      <Code className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300">IDEA</span>
                    </div>
                    <div className="w-6 md:w-12 h-px bg-gradient-to-r from-purple-500/50 to-green-500/50" />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-500/30 rounded-lg">
                      <Terminal className="w-4 h-4 text-green-400" />
                      <span className="text-green-300">BUILD</span>
                    </div>
                  </div>

                  {/* Center - 404 Node */}
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-6 md:w-12 h-px bg-gradient-to-r from-green-500/50 to-blue-500/50" />
                    <div 
                      className="relative px-6 py-3 bg-gray-900/50 border-2 border-red-500/50 rounded-lg"
                      aria-label="404 - Page not found"
                    >
                      <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-lg" />
                      <span className="relative text-2xl md:text-3xl font-bold text-red-400">404</span>
                      <div className="absolute -inset-1 bg-red-500/20 blur-xl -z-10" />
                    </div>
                    <div className="w-6 md:w-12 h-px bg-gray-700/50" />
                  </div>

                  {/* Bottom Path */}
                  <div className="flex items-center gap-2 md:gap-3 opacity-40 text-sm md:text-base">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">SECURE</span>
                    </div>
                    <div className="w-6 md:w-12 h-px bg-gradient-to-r from-blue-500/50 to-cyan-500/50" />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-900/30 border border-cyan-500/30 rounded-lg">
                      <Cloud className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300">SHIP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  404
                </h1>
                <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
                  Looks like this path doesn't exist.
                </h2>
                <p className="text-lg md:text-xl text-gray-400 mb-2 max-w-2xl mx-auto">
                  The page you're looking for may have moved, been removed, or never existed.
                </p>
                <p className="text-base md:text-lg text-gray-500">
                  Don't worry — your project is still here.
                </p>
              </div>

              {/* Requested Path Display */}
              {displayPath && displayPath !== '/unknown' && (
                <div className="mb-8 text-center">
                  <p className="text-sm text-gray-500 mb-2">You were looking for:</p>
                  <code className="inline-block px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 text-sm break-all">
                    {displayPath}
                  </code>
                </div>
              )}

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link 
                  href="/" 
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition"
                >
                  <Home className="w-5 h-5" />
                  Back to VettCode
                </Link>
                <Link 
                  href="/#ecosystem" 
                  className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition"
                >
                  Explore the Ecosystem
                </Link>
              </div>

              {/* Secondary Navigation Help */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                <p className="text-center text-gray-400 mb-6">Looking for something?</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link 
                    href="/vibe" 
                    className="group flex flex-col items-center gap-2 p-4 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition"
                  >
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <span className="text-sm font-semibold text-center">VettCode Vibe</span>
                  </Link>
                  <Link 
                    href="/vibe-cli" 
                    className="group flex flex-col items-center gap-2 p-4 bg-green-900/20 hover:bg-green-900/30 border border-green-500/20 hover:border-green-500/40 rounded-xl transition"
                  >
                    <Terminal className="w-6 h-6 text-green-400" />
                    <span className="text-sm font-semibold text-center">Vibe CLI</span>
                  </Link>
                  <Link 
                    href="/cli" 
                    className="group flex flex-col items-center gap-2 p-4 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition"
                  >
                    <Shield className="w-6 h-6 text-blue-400" />
                    <span className="text-sm font-semibold text-center">CLI</span>
                  </Link>
                  <Link 
                    href="/hosting" 
                    className="group flex flex-col items-center gap-2 p-4 bg-cyan-900/20 hover:bg-cyan-900/30 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition"
                  >
                    <Cloud className="w-6 h-6 text-cyan-400" />
                    <span className="text-sm font-semibold text-center">Web Host</span>
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
                  <Link href="/docs" className="text-gray-400 hover:text-white transition">
                    Documentation
                  </Link>
                  <span className="text-gray-700">•</span>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition">
                    Pricing
                  </Link>
                  <span className="text-gray-700">•</span>
                  <Link href="/developers" className="text-gray-400 hover:text-white transition">
                    Developers
                  </Link>
                </div>
              </div>

              {/* Brand Statement */}
              <div className="mt-12 text-center">
                <p className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text">
                  Build. Secure. Ship.
                </p>
                <p className="text-gray-400 mb-6">Your next idea is still waiting.</p>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition"
                >
                  Start Building <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
