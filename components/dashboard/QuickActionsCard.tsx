/**
 * Quick Actions Card
 * Provides quick access to major VettCode ecosystem features
 */

'use client'

import Link from 'next/link'
import { Code, Shield, Rocket, BookOpen, Terminal } from 'lucide-react'

export default function QuickActionsCard() {
  const actions = [
    {
      icon: Code,
      label: 'Vibe Coder',
      description: 'Build with AI',
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-700 hover:to-purple-800',
      href: null,
      onClick: () => alert('VettCode Vibe Coder coming soon!'),
      comingSoon: true,
    },
    {
      icon: Terminal,
      label: 'Security Scan',
      description: 'Check your code',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800',
      href: '/setup/security-scan',
      onClick: null,
      comingSoon: false,
    },
    {
      icon: Rocket,
      label: 'Deploy',
      description: 'Ship your project',
      color: 'from-orange-600 to-orange-700',
      hoverColor: 'hover:from-orange-700 hover:to-orange-800',
      href: null,
      onClick: () => alert('Deployment integration coming soon!'),
      comingSoon: true,
    },
    {
      icon: BookOpen,
      label: 'Learn',
      description: 'AI Coach',
      color: 'from-green-600 to-green-700',
      hoverColor: 'hover:from-green-700 hover:to-green-800',
      href: '/dashboard/scans',
      onClick: null,
      comingSoon: false,
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          const baseClasses = `relative p-4 bg-gradient-to-br ${action.color} ${action.hoverColor} rounded-xl transition-all transform hover:scale-105 shadow-lg text-left group block`
          
          // Render as Link if href exists
          if (action.href) {
            return (
              <Link
                key={action.label}
                href={action.href}
                className={baseClasses}
              >
                {action.comingSoon && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-semibold">
                      Soon
                    </span>
                  </div>
                )}
                
                <Icon className="w-8 h-8 mb-3 opacity-90" />
                <div>
                  <div className="font-semibold mb-0.5">{action.label}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </Link>
            )
          }
          
          // Render as button if onClick exists
          return (
            <button
              key={action.label}
              onClick={action.onClick || undefined}
              className={baseClasses}
            >
              {action.comingSoon && (
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-semibold">
                    Soon
                  </span>
                </div>
              )}
              
              <Icon className="w-8 h-8 mb-3 opacity-90" />
              <div>
                <div className="font-semibold mb-0.5">{action.label}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
