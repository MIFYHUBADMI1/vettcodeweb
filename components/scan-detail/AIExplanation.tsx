/**
 * AI Explanation Component
 * Displays AI-generated beginner-friendly explanations
 */

'use client'

import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, BookOpen, Shield, Wrench, GraduationCap, AlertTriangle } from 'lucide-react'
import { Finding, Explanation } from '@/lib/types'

interface AIExplanationProps {
  finding: Finding
}

export default function AIExplanation({ finding }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'template' | 'ai' | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)

  const fetchExplanation = async () => {
    setLoading(true)
    setError(null)
    setQuotaExceeded(false)

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
      
      if (data.quotaExceeded) {
        setQuotaExceeded(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!explanation && !loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">AI Security Coach</h3>
        <p className="text-gray-400 text-center mb-6 max-w-md">
          Get a beginner-friendly explanation of this security issue, why it matters, and how to fix it.
        </p>
        <button
          onClick={fetchExplanation}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Get AI Explanation
        </button>
        <p className="text-xs text-gray-500 mt-3">Powered by AI • Free for students</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
        <p className="text-gray-400">Generating explanation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Failed to generate explanation</p>
            <p className="text-red-300/70 text-sm mt-1">{error}</p>
            <button
              onClick={fetchExplanation}
              className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!explanation) return null

  return (
    <div className="space-y-6">
      {/* Source Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {source === 'ai' ? (
            <>
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">AI-Generated Explanation</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Template-Based Explanation</span>
            </>
          )}
        </div>
        <button
          onClick={fetchExplanation}
          disabled={loading}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Regenerate
        </button>
      </div>

      {/* Quota Warning */}
      {quotaExceeded && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium text-sm">AI Quota Exceeded</p>
              <p className="text-yellow-300/70 text-xs mt-1">
                You've reached your daily AI request limit. Showing template-based explanation instead.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confidence Note */}
      {explanation.confidenceNote && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
          <p className="text-blue-300 text-sm">{explanation.confidenceNote}</p>
        </div>
      )}

      {/* What's Wrong */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">What's Wrong?</h3>
            <p className="text-gray-300 leading-relaxed">{explanation.whatsWrong}</p>
          </div>
        </div>
      </div>

      {/* Why It Matters */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Why Does It Matter?</h3>
            <p className="text-gray-300 leading-relaxed">{explanation.whyItMatters}</p>
          </div>
        </div>
      </div>

      {/* How to Fix */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">How Do I Fix It?</h3>
            <p className="text-gray-300 leading-relaxed">{explanation.howToFix}</p>
          </div>
        </div>
      </div>

      {/* Fix Example */}
      {explanation.fixExample && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Code Example</h3>
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-gray-300 font-mono whitespace-pre">
              {explanation.fixExample}
            </code>
          </pre>
        </div>
      )}

      {/* What You Learn */}
      <div className="bg-purple-500/10 border border-purple-500/50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">What You Learn</h3>
            <p className="text-purple-200 leading-relaxed">{explanation.whatYouLearn}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
