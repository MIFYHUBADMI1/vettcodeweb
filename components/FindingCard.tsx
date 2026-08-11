'use client'

import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { Finding } from '@/lib/types'
import ExplanationModal from './ExplanationModal'

interface FindingCardProps {
  finding: Finding
}

export default function FindingCard({ finding }: FindingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const severityColors = {
    CRITICAL: 'bg-red-50 border-red-300 text-red-800',
    HIGH: 'bg-orange-50 border-orange-300 text-orange-800',
    MEDIUM: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    LOW: 'bg-blue-50 border-blue-300 text-blue-800',
    INFO: 'bg-gray-50 border-gray-300 text-gray-800',
  }

  const severityIcons = {
    CRITICAL: '🔥',
    HIGH: '🔴',
    MEDIUM: '🟡',
    LOW: '⚪',
    INFO: 'ℹ️',
  }

  const categoryIcons = {
    CODE: '💻',
    SECRET: '🔐',
    DEPENDENCY: '📦',
    CONFIG: '⚙️',
  }

  return (
    <>
      <div
        className={`border-2 rounded-lg p-6 transition-all animate-fade-in ${
          severityColors[finding.severity]
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{severityIcons[finding.severity]}</span>
              <span className="text-2xl">{categoryIcons[finding.category]}</span>
              <h3 className="text-lg font-bold">{finding.title}</h3>
            </div>
            <p className="text-sm font-mono text-gray-600 mb-2">
              📍 {finding.file}:{finding.line}
              {finding.column && `:${finding.column}`}
            </p>
            {finding.confidence !== undefined && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Confidence:</span>
                <span className="font-semibold">{finding.confidenceLabel || `${Math.round(finding.confidence * 100)}%`}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-700 mt-4">{finding.message}</p>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-current/20 space-y-3">
            {finding.metadata.ruleId && (
              <div>
                <span className="font-semibold text-sm">Rule ID:</span>
                <span className="ml-2 text-sm font-mono">{finding.metadata.ruleId}</span>
              </div>
            )}
            {finding.metadata.cwe && finding.metadata.cwe.length > 0 && (
              <div>
                <span className="font-semibold text-sm">CWE:</span>
                <span className="ml-2 text-sm">{finding.metadata.cwe.join(', ')}</span>
              </div>
            )}
            {finding.metadata.owasp && finding.metadata.owasp.length > 0 && (
              <div>
                <span className="font-semibold text-sm">OWASP:</span>
                <span className="ml-2 text-sm">{finding.metadata.owasp.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* AI Explanation Button */}
        <div className="mt-4">
          <button
            onClick={() => setShowExplanation(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Get AI Explanation</span>
          </button>
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanation && (
        <ExplanationModal finding={finding} onClose={() => setShowExplanation(false)} />
      )}
    </>
  )
}
