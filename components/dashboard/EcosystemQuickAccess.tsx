'use client'

import Link from 'next/link'
import { Hammer, Shield, Cloud, ArrowRight } from 'lucide-react'

const MIRRORSITE_URL = 'https://mirrorsite.atai.ink'

export default function EcosystemQuickAccess() {
  const products = [
    {
      id: 'mirrorsite',
      name: 'MirrorSite AI',
      description: 'Build applications from ideas or existing websites',
      icon: Hammer,
      href: MIRRORSITE_URL,
      external: true,
      gradient: 'from-violet-600 to-purple-600',
      hoverGradient: 'hover:from-violet-500 hover:to-purple-500',
      comingSoon: false,
    },
    {
      id: 'vettcode',
      name: 'VettCode',
      description: 'Security scanning and vulnerability detection',
      icon: Shield,
      href: '/dashboard/scans',
      external: false,
      gradient: 'from-blue-600 to-cyan-600',
      hoverGradient: 'hover:from-blue-500 hover:to-cyan-500',
      comingSoon: false,
    },
    {
      id: 'hosting',
      name: 'Web Host',
      description: 'Deploy and host your applications globally',
      icon: Cloud,
      href: '#',
      external: false,
      gradient: 'from-gray-700 to-gray-800',
      hoverGradient: '',
      comingSoon: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => {
        const Icon = product.icon
        const isDisabled = product.comingSoon

        const cardContent = (
          <div className="relative">
            {isDisabled && (
              <span className="absolute top-0 right-0 text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-lg border border-gray-700">
                Soon
              </span>
            )}

            <div className="flex items-start gap-4">
              <div className={`p-3 bg-gradient-to-br ${product.gradient} rounded-lg ${isDisabled ? 'opacity-50' : ''}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  {product.name}
                  {!isDisabled && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        )

        const className = `
          group bg-gray-900 border border-gray-800 rounded-xl p-5
          transition-all duration-200
          ${isDisabled ? 'cursor-not-allowed opacity-75' : `${product.hoverGradient} hover:border-gray-700 hover:shadow-lg`}
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
  )
}
