/**
 * VettCode Summary Component
 * Beginner-friendly scan explanation
 */

'use client'

import { Sparkles, AlertCircle } from 'lucide-react'

interface VettCodeSummaryProps {
  totalFindings: number
  criticalCount: number
  highCount: number
  mediumCount: number
  scanPath: string
}

export default function VettCodeSummary({
  totalFindings,
  criticalCount,
  highCount,
  mediumCount,
  scanPath,
}: VettCodeSummaryProps) {
  // Generate beginner-friendly summary
  const getSummaryText = () => {
    if (totalFindings === 0) {
      return "Great news! We didn't find any security issues in your scan. Your code looks secure!"
    }

    if (criticalCount > 0) {
      return `We found ${totalFindings} potential security ${
        totalFindings === 1 ? 'issue' : 'issues'
      } in this scan, including ${criticalCount} critical ${
        criticalCount === 1 ? 'issue' : 'issues'
      } that need immediate attention.`
    }

    if (highCount > 0) {
      return `We found ${totalFindings} security ${
        totalFindings === 1 ? 'issue' : 'issues'
      } in your scan. ${highCount} ${
        highCount === 1 ? 'is' : 'are'
      } high severity and should be addressed soon.`
    }

    return `We found ${totalFindings} potential security ${
      totalFindings === 1 ? 'issue' : 'issues'
    } in your scan. Most are lower severity, but it's good to review them when you have time.`
  }

  const getActionText = () => {
    if (totalFindings === 0) {
      return 'Keep up the good security practices!'
    }

    if (criticalCount > 0 || highCount > 5) {
      return 'You don't need to fix everything at once. Start with the priority findings below — they're the most important.'
    }

    return 'Review the priority findings below to understand what needs attention. Focus on fixing one issue at a time.'
  }

  if (totalFindings === 0) {
    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">VettCode Analysis</h2>
            <p className="text-gray-300 mb-3 leading-relaxed">{getSummaryText()}</p>
            <p className="text-sm text-green-400">{getActionText()}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-2">VettCode Analysis</h2>
          <p className="text-gray-300 mb-3 leading-relaxed">{getSummaryText()}</p>
          <p className="text-sm text-gray-400 leading-relaxed">{getActionText()}</p>

          {/* Helpful Tips */}
          {(criticalCount > 0 || highCount > 0) && (
            <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <span className="font-semibold text-blue-400">Tip:</span> Security issues are grouped
                  by priority below. Fixing one issue often teaches you how to fix similar ones faster.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
