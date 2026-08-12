/**
 * Finding Card Component
 * Enhanced display for individual finding
 */

'use client'

import { FileCode, Info, ChevronRight } from 'lucide-react'
import { Finding } from '@/lib/types'
import clsx from 'clsx'

interface FindingCardProps {
  finding: Finding
  onClick?: () => void
}

export default function FindingCard({ finding, onClick }: FindingCardProps) {
  const getSeverityBadge = (severity: Finding['severity']) => {
    const styles = {
      CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/50',
      HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/50',
      MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
      LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/50',
      INFO: 'bg-gray-500/10 text-gray-400 border-gray-500/50',
    }

    return (
      <span className={clsx('inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border', styles[severity])}>
        {severity}
      </span>
    )
  }

  const getCategoryBadge = (category: Finding['category']) => {
    const icons = {
      CODE: '🐛',
      SECRET: '🔑',
      DEPENDENCY: '📦',
      CONFIG: '⚙️',
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs">
        <span>{icons[category] || '📋'}</span>
        <span>{category}</span>
      </span>
    )
  }

  const getConfidenceBadge = (confidence?: number, label?: string) => {
    if (!confidence && !label) return null

    const displayLabel = label || (confidence && confidence >= 0.85 ? 'High' : confidence && confidence >= 0.6 ? 'Medium' : 'Low')
    const color = label === 'High' || (confidence && confidence >= 0.85)
      ? 'text-green-400 bg-green-500/10 border-green-500/50'
      : label === 'Medium' || (confidence && confidence >= 0.6)
      ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50'
      : 'text-orange-400 bg-orange-500/10 border-orange-500/50'

    return (
      <span className={clsx('inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border', color)}>
        <Info className="w-3 h-3" />
        <span>Confidence: {displayLabel}</span>
      </span>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-900/50 border border-gray-700 hover:border-purple-500/50 rounded-xl p-5 transition-all group text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {getSeverityBadge(finding.severity)}
          {getCategoryBadge(finding.category)}
          {getConfidenceBadge(finding.confidence, finding.confidenceLabel)}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-0.5" />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
        {finding.title}
      </h3>

      {/* Message */}
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{finding.message}</p>

      {/* Location */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <FileCode className="w-3.5 h-3.5" />
        <span className="font-mono truncate">{finding.file}</span>
        {finding.line && (
          <>
            <span>:</span>
            <span className="text-purple-400 font-medium">{finding.line}</span>
          </>
        )}
      </div>

      {/* Rule ID (if available) */}
      {finding.metadata.ruleId && (
        <div className="mt-2 text-xs text-gray-500">
          Rule: <span className="font-mono">{finding.metadata.ruleId}</span>
        </div>
      )}
    </button>
  )
}
