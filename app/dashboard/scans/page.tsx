/**
 * Security Scans Page
 * /dashboard/scans
 * 
 * Displays user's scan history with centralized caching
 */

'use client'

import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import RefreshButton from '@/components/RefreshButton'
import { useScans } from '@/lib/hooks/useScans'
import Link from 'next/link'
import { 
  Shield, 
  Clock,
  AlertCircle,
  CheckCircle,
  Terminal,
  ChevronRight
} from 'lucide-react'

export default function ScansPage() {
  const { data: session } = useSession()
  const { data, isLoading, error, refetch, dataUpdatedAt, isFetching } = useScans()

  const scans = data?.scans || []

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getSeverityColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-blue-400'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Security Scans</h1>
            </div>
            <p className="text-gray-400">
              View and manage your VettCode CLI scan history
            </p>
          </div>

          {/* Refresh Button */}
          {!isLoading && scans.length > 0 && (
            <RefreshButton 
              onRefresh={refetch}
              isRefreshing={isFetching}
              lastUpdated={new Date(dataUpdatedAt)}
            />
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-400">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Failed to load scans</p>
                <p className="text-sm mt-1">{error.message || 'Failed to load scans'}</p>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && scans.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
            <Terminal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No security scans yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Run your first VettCode scan and your results will appear here
            </p>
            <div className="bg-gray-900/50 rounded-lg p-4 max-w-xl mx-auto text-left">
              <p className="text-sm text-gray-400 mb-2">Quick Start:</p>
              <code className="block bg-black/50 rounded px-4 py-2 text-green-400 font-mono text-sm">
                $ vettcode login
                <br />
                $ vettcode scan .
              </code>
            </div>
          </div>
        )}

        {/* Scans List */}
        {!isLoading && !error && scans.length > 0 && (
          <div className="space-y-4">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/dashboard/scans/${scan.id}`}
                className="block bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 rounded-xl p-6 transition-all hover:bg-gray-800/70 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Scan Path */}
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                        {scan.scanPath || 'Security Scan'}
                      </h3>
                    </div>

                    {/* Severity Badges */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {scan.criticalCount > 0 && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span className={getSeverityColor('critical')}>
                            {scan.criticalCount} Critical
                          </span>
                        </span>
                      )}
                      {scan.highCount > 0 && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className={getSeverityColor('high')}>
                            {scan.highCount} High
                          </span>
                        </span>
                      )}
                      {scan.mediumCount > 0 && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className={getSeverityColor('medium')}>
                            {scan.mediumCount} Medium
                          </span>
                        </span>
                      )}
                      {scan.lowCount > 0 && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className={getSeverityColor('low')}>
                            {scan.lowCount} Low
                          </span>
                        </span>
                      )}
                      {scan.totalFindings === 0 && (
                        <span className="flex items-center gap-1.5 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          No issues found
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{getRelativeTime(scan.createdAt)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-white">{scan.totalFindings}</span> total findings
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
