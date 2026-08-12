/**
 * Scan Detail Page
 * /dashboard/scans/[scanId]
 * 
 * Displays detailed scan results with centralized caching
 */

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import RefreshButton from '@/components/RefreshButton'
import { useScan } from '@/lib/hooks/useScans'
import { 
  Shield, 
  Clock,
  AlertCircle,
  ChevronLeft,
  FileCode,
  Info
} from 'lucide-react'
import type { Finding } from '@/lib/types'

export default function ScanDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const scanId = params.scanId as string

  const { data, isLoading, error, refetch, dataUpdatedAt, isFetching } = useScan(scanId)
  
  const scan = data?.scan

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getSeverityBadge = (severity: Finding['severity']) => {
    const styles = {
      CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/50',
      HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/50',
      MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
      LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/50',
      INFO: 'bg-gray-500/10 text-gray-400 border-gray-500/50',
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${styles[severity]}`}>
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

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Header with Back Button and Refresh */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard/scans')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to scans</span>
          </button>

          {/* Refresh Button */}
          {!isLoading && scan && (
            <RefreshButton 
              onRefresh={refetch}
              isRefreshing={isFetching}
              lastUpdated={new Date(dataUpdatedAt)}
            />
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-400">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Failed to load scan</p>
                <p className="text-sm mt-1">{error.message || 'Failed to load scan'}</p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/scans')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
                  >
                    Go back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Content */}
        {scan && !isLoading && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-white mb-2">Security Scan</h1>
                  <p className="text-gray-400">{scan.scanPath}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{getRelativeTime(scan.createdAt)}</span>
                </div>
                <span>•</span>
                <span>{new Date(scan.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {scan.criticalCount}
                </div>
                <div className="text-sm text-red-300">Critical</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-orange-400 mb-1">
                  {scan.highCount}
                </div>
                <div className="text-sm text-orange-300">High</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {scan.mediumCount}
                </div>
                <div className="text-sm text-yellow-300">Medium</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {scan.lowCount}
                </div>
                <div className="text-sm text-blue-300">Low</div>
              </div>
              <div className="bg-gray-500/10 border border-gray-500/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-gray-400 mb-1">
                  {scan.infoCount}
                </div>
                <div className="text-sm text-gray-300">Info</div>
              </div>
            </div>

            {/* Findings */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Findings ({scan.totalFindings})
              </h2>

              {scan.totalFindings === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    No issues found
                  </h3>
                  <p className="text-gray-400">
                    Your code looks secure!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scan.scanData.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
                    >
                      {/* Finding Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {getSeverityBadge(finding.severity)}
                            {getCategoryBadge(finding.category)}
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {finding.title}
                          </h3>
                          <p className="text-gray-300">{finding.message}</p>
                        </div>
                      </div>

                      {/* Finding Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                        <FileCode className="w-4 h-4" />
                        <span className="font-mono">{finding.file}</span>
                        {finding.line && (
                          <>
                            <span>:</span>
                            <span className="text-purple-400">{finding.line}</span>
                          </>
                        )}
                      </div>

                      {/* Confidence */}
                      {finding.confidenceLabel && (
                        <div className="flex items-center gap-2 text-sm">
                          <Info className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">
                            Confidence: <span className="text-white">{finding.confidenceLabel}</span>
                          </span>
                        </div>
                      )}

                      {/* Metadata */}
                      {finding.metadata && Object.keys(finding.metadata).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <details className="text-sm">
                            <summary className="text-gray-400 cursor-pointer hover:text-white transition-colors">
                              Additional details
                            </summary>
                            <div className="mt-3 space-y-2 text-gray-400">
                              {finding.metadata.ruleId && (
                                <div>
                                  <span className="font-medium text-white">Rule:</span> {finding.metadata.ruleId}
                                </div>
                              )}
                              {finding.metadata.cwe && finding.metadata.cwe.length > 0 && (
                                <div>
                                  <span className="font-medium text-white">CWE:</span> {finding.metadata.cwe.join(', ')}
                                </div>
                              )}
                              {finding.metadata.references && finding.metadata.references.length > 0 && (
                                <div>
                                  <span className="font-medium text-white">References:</span>
                                  <ul className="ml-4 mt-1 space-y-1">
                                    {finding.metadata.references.slice(0, 3).map((ref: string, idx: number) => (
                                      <li key={idx}>
                                        <a
                                          href={ref}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                          {ref}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
