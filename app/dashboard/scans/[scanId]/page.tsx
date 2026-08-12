/**
 * Scan Detail Page - VettCode Security Report
 * /dashboard/scans/[scanId]
 * 
 * Professional, educational security analysis experience
 */

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import RefreshButton from '@/components/RefreshButton'
import SecurityScoreCard from '@/components/scan-detail/SecurityScoreCard'
import VettCodeSummary from '@/components/scan-detail/VettCodeSummary'
import PriorityFindings from '@/components/scan-detail/PriorityFindings'
import FindingExplorer from '@/components/scan-detail/FindingExplorer'
import FindingDetailModal from '@/components/scan-detail/FindingDetailModal'
import { useScan } from '@/lib/hooks/useScans'
import { 
  Shield, 
  Clock,
  AlertCircle,
  ChevronLeft,
  Sparkles
} from 'lucide-react'
import type { Finding } from '@/lib/types'

export default function ScanDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const scanId = params.scanId as string

  const { data, isLoading, error, refetch, dataUpdatedAt, isFetching } = useScan(scanId)
  
  const scan = data?.scan
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null)

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

  const handleFindingClick = (finding: Finding) => {
    setSelectedFinding(finding)
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/scans/${scanId}/ai`)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Overview</span>
              </button>
              
              <RefreshButton 
                onRefresh={refetch}
                isRefreshing={isFetching}
                lastUpdated={new Date(dataUpdatedAt)}
              />
            </div>
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
                  <h1 className="text-2xl font-bold text-white mb-2">Security Report</h1>
                  <p className="text-gray-400">{scan.scanPath}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{getRelativeTime(scan.createdAt)}</span>
                </div>
                <span>•</span>
                <span>{new Date(scan.timestamp).toLocaleString()}</span>
                {scan.sensorsUsed && scan.sensorsUsed.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{scan.sensorsUsed.length} scanners used</span>
                  </>
                )}
              </div>
            </div>

            {/* Security Score Card */}
            <SecurityScoreCard
              criticalCount={scan.criticalCount}
              highCount={scan.highCount}
              mediumCount={scan.mediumCount}
              lowCount={scan.lowCount}
              infoCount={scan.infoCount}
              totalFindings={scan.totalFindings}
            />

            {/* VettCode Summary */}
            <VettCodeSummary
              totalFindings={scan.totalFindings}
              criticalCount={scan.criticalCount}
              highCount={scan.highCount}
              mediumCount={scan.mediumCount}
              scanPath={scan.scanPath}
            />

            {/* Priority Findings */}
            {scan.totalFindings > 0 && (
              <PriorityFindings
                findings={scan.scanData.findings}
                onFindingClick={handleFindingClick}
              />
            )}

            {/* Finding Explorer */}
            {scan.totalFindings > 0 && (
              <FindingExplorer
                findings={scan.scanData.findings}
                onFindingClick={handleFindingClick}
              />
            )}
          </div>
        )}
      </div>

      {/* Finding Detail Modal */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </DashboardLayout>
  )
}
