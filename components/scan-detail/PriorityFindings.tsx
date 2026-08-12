/**
 * Priority Findings Component
 * Shows top priority issues grouped by type
 */

'use client'

import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Finding } from '@/lib/types'
import { getPriorityFindings, getSeverityEmoji } from '@/lib/finding-prioritizer'

interface PriorityFindingsProps {
  findings: Finding[]
  onFindingClick?: (finding: Finding) => void
}

export default function PriorityFindings({ findings, onFindingClick }: PriorityFindingsProps) {
  const priorityGroups = getPriorityFindings(findings, 5)

  if (priorityGroups.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">What Should I Fix First?</h2>
          <p className="text-sm text-gray-400">Start with these high-priority issues</p>
        </div>
      </div>

      {/* Priority Groups */}
      <div className="space-y-3">
        {priorityGroups.map((group, index) => {
          const severityEmoji = getSeverityEmoji(group.highestSeverity)
          const firstFinding = group.findings[0]

          return (
            <button
              key={`${group.category}-${group.title}-${index}`}
              onClick={() => onFindingClick?.(firstFinding)}
              className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-900/70 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Priority Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-400">{index + 1}</span>
                </div>

                {/* Emoji & Info */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{severityEmoji}</span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                        {group.category}
                      </span>
                      <span className="font-medium text-white truncate">{group.title}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {group.count} {group.count === 1 ? 'finding' : 'findings'}
                      {' • '}
                      <span className={getSeverityColor(group.highestSeverity)}>
                        {group.highestSeverity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
            </button>
          )
        })}
      </div>

      {/* Helpful Note */}
      <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-gray-400 leading-relaxed">
          💡 <span className="text-blue-400 font-medium">Tip:</span> These are grouped by type and
          sorted by urgency. Fixing one issue in a group often helps you fix similar issues faster.
        </p>
      </div>
    </div>
  )
}

function getSeverityColor(severity: Finding['severity']): string {
  const colors = {
    CRITICAL: 'text-red-400',
    HIGH: 'text-orange-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-blue-400',
    INFO: 'text-gray-400',
  }
  return colors[severity]
}
