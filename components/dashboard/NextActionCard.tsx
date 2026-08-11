'use client'

import { ArrowRight, FolderPlus, Shield, Rocket } from 'lucide-react'

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
  const getActionConfig = () => {
    if (!hasProjects) {
      return {
        icon: FolderPlus,
        title: 'Create your first project',
        description: 'Start with an idea and turn it into something real.',
        action: 'Create Project',
        onClick: () => alert('Project creation coming soon!'),
        color: 'purple'
      }
    }

    if (!hasScannedProjects) {
      return {
        icon: Shield,
        title: 'Secure your project',
        description: 'Run a VettCode scan to understand what needs attention.',
        action: 'Run Security Scan',
        onClick: () => alert('Security scanning integration coming soon!'),
        color: 'blue'
      }
    }

    if (!hasDeployments) {
      return {
        icon: Rocket,
        title: 'Ship your project',
        description: 'Your project is ready to move toward deployment.',
        action: 'Deploy',
        onClick: () => alert('Deployment integration coming soon!'),
        color: 'orange'
      }
    }

    return null
  }

  const actionConfig = getActionConfig()

  if (!actionConfig) {
    return null
  }

  const Icon = actionConfig.icon

  const colorClasses = {
    purple: {
      bg: 'bg-purple-600/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
    },
    blue: {
      bg: 'bg-blue-600/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    },
    orange: {
      bg: 'bg-orange-600/20',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      button: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
    }
  }

  const colors = colorClasses[actionConfig.color as keyof typeof colorClasses]

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

        <button
          onClick={actionConfig.onClick}
          className={`flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${colors.button} rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg`}
        >
          <span>{actionConfig.action}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
