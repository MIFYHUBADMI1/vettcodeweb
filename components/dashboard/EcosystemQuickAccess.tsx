'use client'

import Link from 'next/link'
import { Sparkles, Terminal, Shield, Cloud, ArrowRight } from 'lucide-react'

export default function EcosystemQuickAccess() {
  const products = [
    {
      id: 'vibe',
      name: 'VettCode Vibe',
      description: 'Turn ideas into applications with AI',
      icon: Sparkles,
      color: 'purple',
      href: '/dashboard/vibe',
      bgGradient: 'from-purple-900/30 to-purple-800/10',
      borderColor: 'border-purple-500/30 hover:border-purple-500/50',
      iconBg: 'bg-purple-500/20 group-hover:bg-purple-500/30',
      iconColor: 'text-purple-400',
      linkColor: 'text-purple-400 hover:text-purple-300',
      comingSoon: true,
    },
    {
      id: 'vibe-cli',
      name: 'Vibe CLI',
      description: 'AI coding agent in your terminal',
      icon: Terminal,
      color: 'green',
      href: '/dashboard/vibe-cli',
      bgGradient: 'from-green-900/30 to-green-800/10',
      borderColor: 'border-green-500/30 hover:border-green-500/50',
      iconBg: 'bg-green-500/20 group-hover:bg-green-500/30',
      iconColor: 'text-green-400',
      linkColor: 'text-green-400 hover:text-green-300',
      comingSoon: true,
    },
    {
      id: 'cli',
      name: 'VettCode CLI',
      description: 'Security scans for your projects',
      icon: Shield,
      color: 'blue',
      href: '/dashboard/scans',
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
      description: 'Deploy your applications globally',
      icon: Cloud,
      color: 'cyan',
      href: '/dashboard/hosting',
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
        <h2 className="text-2xl font-bold text-gray-900">VettCode Ecosystem</h2>
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
          
          return (
            <Link
              key={product.id}
              href={product.comingSoon ? '#' : product.href}
              className={`
                group relative bg-gradient-to-br ${product.bgGradient} 
                border ${product.borderColor} rounded-xl p-6 
                transition-all duration-200
                ${product.comingSoon ? 'cursor-not-allowed opacity-75' : 'hover:shadow-lg'}
              `}
            >
              {product.comingSoon && (
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

              {!product.comingSoon && (
                <div className={`font-semibold text-sm ${product.linkColor} flex items-center gap-1`}>
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-green-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>One ecosystem.</strong> Create with Vibe, code with Vibe CLI, secure with VettCode CLI, and deploy with Web Host.
        </p>
      </div>
    </div>
  )
}
