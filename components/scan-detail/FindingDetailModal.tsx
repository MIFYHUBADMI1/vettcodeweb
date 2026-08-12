/**
 * Finding Detail Modal with AI Coach
 * Full finding information + AI-powered explanations
 */

'use client'

import { useState } from 'react'
import { X, FileCode, AlertCircle, Sparkles, BookOpen, Shield, Wrench } from 'lucide-react'
import { Finding } from '@/lib/types'
import clsx from 'clsx'
import AIExplanation from './AIExplanation'

interface FindingDetailModalProps {
  finding: Finding
  onClose: () => void
}

export default function FindingDetailModal({ finding, onClose }: FindingDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-coach'>('overview')

  const getSeverityColor = (severity: Finding['severity']) => {
    const colors = {
      CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/50',
      HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/50',
      MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50',
      LOW: 'text-blue-400 bg-blue-500/10 border-blue-500/50',
      INFO: 'text-gray-400 bg-gray-500/10 border-gray-500/50',
    }
    return colors[severity]
  }

  const getCategoryIcon = (category: Finding['category']) => {
    const icons = {
      CODE: '🐛',
      SECRET: '🔑',
      DEPENDENCY: '📦',
      CONFIG: '⚙️',
    }
    return icons[category] || '📋'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-700">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={clsx('px-2 py-1 rounded-md text-xs font-bold border', getSeverityColor(finding.severity))}>
                {finding.severity}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs">
                <span>{getCategoryIcon(finding.category)}</span>
                <span>{finding.category}</span>
              </span>
              {finding.confidenceLabel && (
                <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/50 rounded-md text-xs">
                  Confidence: {finding.confidenceLabel}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">{finding.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={clsx(
              'px-6 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'overview'
                ? 'text-purple-400'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Overview
            </span>
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ai-coach')}
            className={clsx(
              'px-6 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'ai-coach'
                ? 'text-purple-400'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Coach
            </span>
            {activeTab === 'ai-coach' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Message */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Issue Description</h3>
                <p className="text-gray-200 leading-relaxed">{finding.message}</p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Location</h3>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FileCode className="w-4 h-4" />
                    <span className="font-mono text-sm break-all">{finding.file}</span>
                  </div>
                  {finding.line && (
                    <div className="mt-2 text-sm text-gray-400">
                      Line <span className="text-purple-400 font-semibold">{finding.line}</span>
                      {finding.column && (
                        <>, Column <span className="text-purple-400 font-semibold">{finding.column}</span></>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              {finding.metadata && Object.keys(finding.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Additional Information</h3>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
                    {finding.metadata.ruleId && (
                      <div>
                        <span className="text-xs text-gray-500">Rule ID:</span>
                        <p className="text-sm text-gray-300 font-mono mt-1">{finding.metadata.ruleId}</p>
                      </div>
                    )}
                    {finding.metadata.cwe && finding.metadata.cwe.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">CWE:</span>
                        <p className="text-sm text-gray-300 mt-1">{finding.metadata.cwe.join(', ')}</p>
                      </div>
                    )}
                    {finding.metadata.owasp && finding.metadata.owasp.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">OWASP:</span>
                        <p className="text-sm text-gray-300 mt-1">{finding.metadata.owasp.join(', ')}</p>
                      </div>
                    )}
                    {finding.metadata.references && finding.metadata.references.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">References:</span>
                        <div className="mt-1 space-y-1">
                          {finding.metadata.references.map((ref, idx) => (
                            <a
                              key={idx}
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-400 hover:text-purple-300 block truncate"
                            >
                              {ref}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Need Help?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab('ai-coach')}
                    className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 rounded-lg transition-colors text-center group"
                  >
                    <BookOpen className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-purple-300 font-medium">Explain This</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ai-coach')}
                    className="flex flex-col items-center gap-2 p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/50 rounded-lg transition-colors text-center group"
                  >
                    <Shield className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-orange-300 font-medium">Why Dangerous?</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ai-coach')}
                    className="flex flex-col items-center gap-2 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/50 rounded-lg transition-colors text-center group"
                  >
                    <Wrench className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-green-300 font-medium">How to Fix?</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-coach' && (
            <AIExplanation finding={finding} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-800/50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
