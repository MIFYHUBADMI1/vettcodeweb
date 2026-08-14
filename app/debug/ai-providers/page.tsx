'use client'

/**
 * AI Provider Debug Page
 * View provider status and test API keys
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

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
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-2 text-gray-400">Loading provider status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          AI Provider Diagnostic
        </h1>
        <p className="text-gray-400">
          Debug and test your AI provider configuration
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-500 bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={loadStatus}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
        
        <Button
          onClick={runTests}
          disabled={testing || !data?.providers?.totalAvailable}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>Test API Calls</>
          )}
        </Button>
      </div>

      {data && (
        <>
          {/* Status Message */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {data.status === 'ok' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                )}
                <div>
                  <p className="text-lg font-semibold text-white">{data.message}</p>
                  {data.hint && (
                    <p className="text-sm text-gray-400 mt-1">{data.hint}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Check which API keys and secrets are configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(data.environment).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="font-mono text-sm text-gray-300">{key}</span>
                    <Badge variant={value.includes('SET') || value.includes('✓') ? 'default' : 'destructive'}>
                      {value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Provider Status */}
          {data.providers && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  Available Providers
                  <Badge className="ml-3" variant="outline">
                    {data.providers.totalAvailable}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Providers registered and ready to handle requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.providers.totalAvailable === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
                    <p className="font-semibold">No providers available</p>
                    <p className="text-sm mt-1">Set OPENROUTER_API_KEY or GROQ_API_KEY in environment variables</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.providers.providers.map((provider) => (
                      <div key={provider.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-semibold text-white capitalize">{provider.name}</span>
                        </div>
                        <Badge variant="default">Ready</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Test Results */}
          {data.testResults && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  API Test Results
                  {data.summary && (
                    <span className="ml-3 text-sm font-normal text-gray-400">
                      {data.summary.passed} passed · {data.summary.failed} failed
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Actual API calls to each provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.testResults.map((result, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-semibold text-white capitalize">{result.provider}</p>
                            {result.model && (
                              <p className="text-xs text-gray-400 font-mono">{result.model}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={result.success ? 'default' : 'destructive'}>
                          {result.duration}ms
                        </Badge>
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
              </CardContent>
            </Card>
          )}

          {/* Model Registry */}
          <Card>
            <CardHeader>
              <CardTitle>Model Registry</CardTitle>
              <CardDescription>
                Available AI models in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-950/20 rounded-lg border border-purple-800">
                  <p className="text-sm text-gray-400 mb-1">Total Models</p>
                  <p className="text-2xl font-bold text-white">{data.modelRegistry.totalModels}</p>
                </div>
                
                <div className="p-4 bg-green-950/20 rounded-lg border border-green-800">
                  <p className="text-sm text-gray-400 mb-1">Free Models</p>
                  <p className="text-2xl font-bold text-white">{data.modelRegistry.byCost.free}</p>
                </div>
                
                <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-800">
                  <p className="text-sm text-gray-400 mb-1">Paid Models</p>
                  <p className="text-2xl font-bold text-white">{data.modelRegistry.byCost.paid}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.modelRegistry.byTier).map(([tier, count]) => (
                  <div key={tier} className="p-3 bg-gray-800/50 rounded text-center">
                    <p className="text-xs text-gray-400 uppercase">{tier}</p>
                    <p className="text-lg font-semibold text-white">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-500">
              Timestamp: {new Date(data.timestamp).toLocaleString()} · 
              Duration: {data.duration}ms
            </p>
          </div>
        </>
      )}
    </div>
  )
}
