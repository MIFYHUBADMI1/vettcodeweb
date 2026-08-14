'use client'

/**
 * AI Provider Debug Page
 * View provider status and test API keys
 */

import { useState, useEffect } from 'react'

interface DebugResponse {
  status: string
  timestamp: string
  duration: number
  environment: Record<string, string>
  providers?: {
    totalAvailable: number
    providers: Array<{ name: string; available: boolean }>
  }
  summary?: {
    totalProviders: number
    testsRun: number
    passed: number
    failed: number
  }
  testResults?: Array<{
    provider: string
    model?: string
    success: boolean
    responseLength?: number
    responsePreview?: string
    error?: string
    duration: number
  }>
  modelRegistry: {
    totalModels: number
    byTier: Record<string, number>
    byCost: Record<string, number>
    byProvider: Record<string, number>
  }
  message: string
  hint?: string
}

export default function AIProviderDebugPage() {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [data, setData] = useState<DebugResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load basic status on mount
  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/debug/ai-providers')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status')
    } finally {
      setLoading(false)
    }
  }

  const runTests = async () => {
    setTesting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/debug/ai-providers?test=true')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run tests')
    } finally {
      setTesting(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-400">Loading provider status...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            AI Provider Diagnostic
          </h1>
          <p className="text-gray-400 text-lg">
            Debug and test your AI provider configuration
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={loadStatus}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </span>
          </button>
          
          <button
            onClick={runTests}
            disabled={testing || !data?.providers?.totalAvailable}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {testing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Testing...
              </span>
            ) : (
              'Test API Calls'
            )}
          </button>
        </div>

        {data && (
          <>
            {/* Status Message */}
            <div className="mb-6 p-6 bg-gray-900 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {data.status === 'ok' ? (
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <div>
                  <p className="text-lg font-semibold">{data.message}</p>
                  {data.hint && (
                    <p className="text-sm text-gray-400 mt-1">{data.hint}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-2">Environment Variables</h2>
              <p className="text-gray-400 text-sm mb-4">Check which API keys and secrets are configured</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(data.environment).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="font-mono text-sm text-gray-300">{key}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      value.includes('SET') || value.includes('✓') 
                        ? 'bg-green-900/30 text-green-400 border border-green-700' 
                        : 'bg-red-900/30 text-red-400 border border-red-700'
                    }`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider Status */}
            {data.providers && (
              <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold">Available Providers</h2>
                  <span className="px-3 py-1 bg-purple-900/30 text-purple-400 border border-purple-700 rounded-full text-sm font-semibold">
                    {data.providers.totalAvailable}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">Providers registered and ready to handle requests</p>
                
                {data.providers.totalAvailable === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-800/30 rounded-lg">
                    <svg className="h-12 w-12 mx-auto mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-semibold">No providers available</p>
                    <p className="text-sm mt-1">Set OPENROUTER_API_KEY or GROQ_API_KEY in environment variables</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.providers.providers.map((provider) => (
                      <div key={provider.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold capitalize">{provider.name}</span>
                        </div>
                        <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-700 rounded text-sm font-semibold">
                          Ready
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Test Results */}
            {data.testResults && (
              <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">API Test Results</h2>
                  {data.summary && (
                    <p className="text-sm text-gray-400 mt-1">
                      {data.summary.passed} passed · {data.summary.failed} failed
                    </p>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">Actual API calls to each provider</p>
                
                <div className="space-y-4">
                  {data.testResults.map((result, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <div>
                            <p className="font-semibold capitalize">{result.provider}</p>
                            {result.model && (
                              <p className="text-xs text-gray-400 font-mono">{result.model}</p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                          result.success 
                            ? 'bg-green-900/30 text-green-400 border border-green-700' 
                            : 'bg-red-900/30 text-red-400 border border-red-700'
                        }`}>
                          {result.duration}ms
                        </span>
                      </div>
                      
                      {result.success ? (
                        <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                          <p className="text-xs text-gray-500 mb-1">Response Preview:</p>
                          <p className="text-sm text-gray-300 font-mono">{result.responsePreview}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Length: {result.responseLength} characters
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 bg-red-950/20 rounded border border-red-800">
                          <p className="text-xs text-red-400 mb-1">Error:</p>
                          <p className="text-sm text-red-300">{result.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Registry */}
            <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-2">Model Registry</h2>
              <p className="text-gray-400 text-sm mb-4">Available AI models in the system</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-purple-950/20 rounded-lg border border-purple-800">
                  <p className="text-sm text-gray-400 mb-1">Total Models</p>
                  <p className="text-2xl font-bold">{data.modelRegistry.totalModels}</p>
                </div>
                
                <div className="p-4 bg-green-950/20 rounded-lg border border-green-800">
                  <p className="text-sm text-gray-400 mb-1">Free Models</p>
                  <p className="text-2xl font-bold">{data.modelRegistry.byCost.free}</p>
                </div>
                
                <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-800">
                  <p className="text-sm text-gray-400 mb-1">Paid Models</p>
                  <p className="text-2xl font-bold">{data.modelRegistry.byCost.paid}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.modelRegistry.byTier).map(([tier, count]) => (
                  <div key={tier} className="p-3 bg-gray-800/50 rounded text-center">
                    <p className="text-xs text-gray-400 uppercase">{tier}</p>
                    <p className="text-lg font-semibold">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Debug Info */}
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <p className="text-xs text-gray-500">
                Timestamp: {new Date(data.timestamp).toLocaleString()} · 
                Duration: {data.duration}ms
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
