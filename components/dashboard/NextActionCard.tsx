'use client'

import { ArrowRight, Shield, Rocket } from 'lucide-react'

const MIRRORSITE_NEW_URL = 'https://mirrorsite.atai.ink/new'

interface NextActionCardProps {
  hasProjects: boolean
  hasScannedProjects?: boolean
  hasDeployments?: boolean
}

export default function NextActionCard({
  hasProjects,
  hasScannedProjects = false,
  hasDeployments = false
}: NextActionCardProps) {
  type ActionColor = 'violet' | 'blue' | 'orange'

  interface ActionConfig {
    icon: React.ElementType
    title: string
    description: string
    action: string
    color: ActionColor
    href?: string
    onClick?: () => void
    external?: boolean
  }

  const getActionConfig = (): ActionConfig | null => {
    if (!hasProjects) {
      return {
        icon: ArrowRight,
        title: 'Build your first project',
        description: 'Turn an idea or existing website into a full application with MirrorSite AI.',
        action: 'Start building',
        color: 'violet',
        href: MIRRORSITE_NEW_URL,
        external: true,
      }
    }

    if (!hasScannedProjects) {
      return {
        icon: Shield,
        title: 'Secure your project',
        description: 'Run a VettCode scan to understand what needs attention.',
        action: 'Run Security Scan',
        color: 'blue',
        href: '/docs',
      }
    }

    if (!hasDeployments) {
      return {
        icon: Rocket,
        title: 'Ship your project',
        description: 'Your project is ready to move toward deployment.',
        action: 'Deploy',
        color: 'orange',
        onClick: () => alert('Deployment integration coming soon!'),
      }
    }

    return null
  }

  const actionConfig = getActionConfig()

  if (!actionConfig) return null

  const Icon = actionConfig.icon

  const colorClasses: Record<ActionColor, { bg: string; border: string; text: string; button: string }> = {
    violet: {
      bg: 'bg-violet-600/20',
      border: 'border-violet-500/30',
      text: 'text-violet-400',
      button: 'from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800',
    },
    blue: {
      bg: 'bg-blue-600/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    },
    orange: {
      bg: 'bg-orange-600/20',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      button: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
    },
  }

  const colors = colorClasses[actionConfig.color]

  const buttonClass = `flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${colors.button} rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg`

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Next step
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {actionConfig.title}
            </h3>
            <p className="text-gray-400">
              {actionConfig.description}
            </p>
          </div>
        </div>

        {actionConfig.href && actionConfig.external ? (
          <a
            href={actionConfig.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            <span>{actionConfig.action}</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        ) : actionConfig.href ? (
          <a href={actionConfig.href} className={buttonClass}>
            <span>{actionConfig.action}</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        ) : (
          <button onClick={actionConfig.onClick} className={buttonClass}>
            <span>{actionConfig.action}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
