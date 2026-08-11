'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Lightbulb, AlertCircle, Wrench, BookOpen, Code } from 'lucide-react'
import { Finding, Explanation } from '@/lib/types'

interface ExplanationModalProps {
  finding: Finding
  onClose: () => void
}

export default function ExplanationModal({ finding, onClose }: ExplanationModalProps) {
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'template' | 'ai' | 'fallback'>('template')

  useEffect(() => {
    async function fetchExplanation() {
      try {
        const response = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finding }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate explanation')
        }

        const data = await response.json()
        setExplanation(data.explanation)
        setSource(data.source)
      } catch (err: any) {
        setError(err.message || 'Failed to load explanation')
      } finally {
        setLoading(false)
      }
    }

    fetchExplanation()
  }, [finding])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="gradient-bg text-white p-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">AI Security Explanation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Generating explanation...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          ) : explanation ? (
            <div className="space-y-6">
              {/* Source Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {source === 'ai' ? (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                      🤖 AI-Generated
                    </span>
                  ) : source === 'template' ? (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      📖 Knowledge Base
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      ⚡ Quick Reference
                    </span>
                  )}
                </div>
              </div>

              {/* Confidence Note */}
              {explanation.confidenceNote && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">{explanation.confidenceNote}</p>
                </div>
              )}

              {/* Finding Context */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">{explanation.title}</h3>
                <p className="text-sm font-mono text-gray-600">
                  {finding.file}:{finding.line}
                </p>
              </div>

              {/* What's Wrong */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-gray-800">What's Wrong</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{explanation.whatsWrong}</p>
              </div>

              {/* Why It Matters */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-800">Why It Matters</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{explanation.whyItMatters}</p>
              </div>

              {/* How To Fix */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-800">How To Fix</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{explanation.howToFix}</p>
              </div>

              {/* Code Example */}
              {explanation.fixExample && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-800">Code Example</h3>
                  </div>
                  <pre className="code-block">{explanation.fixExample}</pre>
                </div>
              )}

              {/* What You Learn */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-800">🧠 What You Learn</h3>
                </div>
                <p className="text-purple-900 leading-relaxed font-medium">
                  {explanation.whatYouLearn}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
