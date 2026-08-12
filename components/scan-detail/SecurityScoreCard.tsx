/**
 * Security Score Card
 * Displays overall security score and status
 */

'use client'

import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { calculateSecurityScore, getStatusColor, getStatusLabel } from '@/lib/security-score'

interface SecurityScoreCardProps {
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  totalFindings: number
}

export default function SecurityScoreCard({
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
  infoCount,
  totalFindings,
}: SecurityScoreCardProps) {
  const { score, status, description, emoji } = calculateSecurityScore({
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    totalFindings,
  })

  const colors = getStatusColor(status)
  const statusLabel = getStatusLabel(status)

  // Determine trend icon
  const TrendIcon = score >= 80 ? TrendingUp : score >= 50 ? Minus : TrendingDown

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Security Score</h2>
          <p className="text-sm text-gray-400">VettCode Risk Assessment</p>
        </div>
      </div>

      {/* Score Display */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Left: Score */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-xl border border-gray-700">
          <div className="text-6xl font-bold text-white mb-2">{score}</div>
          <div className="text-sm text-gray-400 mb-1">out of 100</div>
          <div className="flex items-center gap-2 mt-2">
            <TrendIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              {score >= 80 ? 'Strong security' : score >= 50 ? 'Moderate' : 'Needs work'}
            </span>
          </div>
        </div>

        {/* Right: Status */}
        <div className="flex flex-col justify-center p-6 bg-gray-900/50 rounded-xl border border-gray-700">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${colors.bg} ${colors.border} ${colors.text} mb-3 w-fit`}>
            <span className="text-2xl">{emoji}</span>
            <span className="font-bold text-lg">{statusLabel}</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-xs text-red-300 mt-1">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{highCount}</div>
          <div className="text-xs text-orange-300 mt-1">High</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{mediumCount}</div>
          <div className="text-xs text-yellow-300 mt-1">Medium</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{lowCount}</div>
          <div className="text-xs text-blue-300 mt-1">Low</div>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-400">{infoCount}</div>
          <div className="text-xs text-gray-300 mt-1">Info</div>
        </div>
      </div>

      {/* Beginner-Friendly Note */}
      <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold text-purple-400">💡 Understanding Your Score:</span>
          {' '}This score helps you understand your overall security posture. You don't need to fix
          everything at once — start with the priority issues below.
        </p>
      </div>
    </div>
  )
}
