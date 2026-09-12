'use client'

import Link from 'next/link'
import { Sparkles, Terminal, Shield, Cloud, Hammer, ArrowRight } from 'lucide-react'

const MIRRORSITE_URL = 'https://mirrorsite.atai.ink'

export default function EcosystemQuickAccess() {
  const products = [
    {
      id: 'mirrorsite',
      name: 'MirrorSite AI',
      description: 'Turn ideas or websites into full applications with AI.',
      icon: Hammer,
      href: MIRRORSITE_URL,
      external: true,
      bgGradient: 'from-violet-900/30 to-violet-800/10',
      borderColor: 'border-violet-500/30 hover:border-violet-500/60',
      iconBg: 'bg-violet-500/20 group-hover:bg-violet-500/30',
      iconColor: 'text-violet-400',
      linkColor: 'text-violet-400 hover:text-violet-300',
      comingSoon: false,
    },
    {
      id: 'cli',
      name: 'VettCode CLI',
      description: 'Security scans for your projects.',
      icon: Shield,
      href: '/dashboard/scans',
      external: false,
      bgGradient: 'from-blue-900/30 to-blue-800/10',
      borderColor: 'border-blue-500/30 hover:border-blue-500/50',
      iconBg: 'bg-blue-500/20 group-hover:bg-blue-500/30',
      iconColor: 'text-blue-400',
      linkColor: 'text-blue-400 hover:text-blue-300',
      comingSoon: false,
    },
    {
      id: 'hosting',
      name: 'Web Host',
      description: 'Deploy your applications globally.',
      icon: Cloud,
      href: '#ship',
      external: false,
      bgGradient: 'from-cyan-900/30 to-cyan-800/10',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/20 group-hover:bg-cyan-500/30',
      iconColor: 'text-cyan-400',
      linkColor: 'text-cyan-400 hover:text-cyan-300',
      comingSoon: true,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">ATAI Ecosystem</h2>
        <Link
          href="/docs"
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          View Docs <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const Icon = product.icon
          const isDisabled = product.comingSoon

          const cardContent = (
            <>
              {isDisabled && (
                <div className="absolute top-3 right-3">
                  <span className="text-xs px-2 py-1 bg-gray-900/50 text-gray-300 rounded-full border border-gray-700">
                    Coming Soon
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 ${product.iconBg} rounded-xl flex items-center justify-center mb-4 transition-colors`}>
                <Icon className={`w-6 h-6 ${product.iconColor}`} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {product.name}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                {product.description}
              </p>

              {!isDisabled && (
                <div className={`font-semibold text-sm ${product.linkColor} flex items-center gap-1`}>
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </>
          )

          const className = `
            group relative bg-gradient-to-br ${product.bgGradient}
            border ${product.borderColor} rounded-xl p-6
            transition-all duration-200
            ${isDisabled ? 'cursor-not-allowed opacity-75' : 'hover:shadow-lg'}
          `

          if (isDisabled) {
            return (
              <div key={product.id} className={className}>
                {cardContent}
              </div>
            )
          }

          if (product.external) {
            return (
              <a
                key={product.id}
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {cardContent}
              </a>
            )
          }

          return (
            <Link key={product.id} href={product.href} className={className}>
              {cardContent}
            </Link>
          )
        })}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>One ecosystem.</strong> Build with MirrorSite AI, secure with VettCode CLI, and ship with Web Host.
        </p>
      </div>
    </div>
  )
}
