'use client'

import { FolderKanban, Shield, Rocket } from 'lucide-react'

interface WorkspaceStatsProps {
  projectCount: number
  securityStatus: 'none' | 'unknown' | 'secure' | 'issues'
  deploymentCount: number
}

export default function WorkspaceStats({ 
  projectCount, 
  securityStatus,
  deploymentCount 
}: WorkspaceStatsProps) {
  const getSecurityDisplay = () => {
    switch (securityStatus) {
      case 'none':
        return '—'
      case 'secure':
        return 'Secure'
      case 'issues':
        return 'Needs attention'
      case 'unknown':
      default:
        return 'Not scanned'
    }
  }

  const getSecurityColor = () => {
    switch (securityStatus) {
      case 'secure':
        return 'text-green-400'
      case 'issues':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Your workspace</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projects */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{projectCount}</div>
          <div className="text-sm text-gray-400 mb-3">Projects</div>
          {projectCount === 0 && (
            <div className="text-xs text-gray-500">Start building to see your projects here</div>
          )}
        </div>

        {/* Security */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${getSecurityColor()}`}>
            {getSecurityDisplay()}
          </div>
          <div className="text-sm text-gray-400 mb-3">Security</div>
          {securityStatus === 'none' && (
            <div className="text-xs text-gray-500">Run your first project scan</div>
          )}
        </div>

        {/* Deployments */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{deploymentCount}</div>
          <div className="text-sm text-gray-400 mb-3">Deployments</div>
          {deploymentCount === 0 && (
            <div className="text-xs text-gray-500">Nothing deployed yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
