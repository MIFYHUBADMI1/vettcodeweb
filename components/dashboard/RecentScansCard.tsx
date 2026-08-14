/**
 * Recent Scans Card
 * Shows 3 most recent security scans on the main dashboard
 */

'use client'

import Link from 'next/link'
import { Shield, ArrowRight, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Scan {
  id: string
  scanPath: string
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  totalFindings: number
  createdAt: string
}

interface RecentScansCardProps {
  scans: Scan[]
  isLoading?: boolean
}

export default function RecentScansCard({ scans, isLoading }: RecentScansCardProps) {
  const recentScans = scans.slice(0, 3)

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return 'Yesterday'
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Security Activity</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 animate-pulse"
            >
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (scans.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Security Activity</h2>
        </div>
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">No security scans yet</p>
          <p className="text-gray-500 text-xs">
            Run <code className="text-purple-400">vettcode scan .</code> to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Security Activity</h2>
        <Link
          href="/dashboard/scans"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentScans.map((scan) => (
          <Link
            key={scan.id}
            href={`/dashboard/scans/${scan.id}`}
            className="block p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                    {scan.scanPath}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {scan.criticalCount > 0 || scan.highCount > 0 ? (
                    <span className="flex items-center gap-1 text-orange-400">
                      <AlertCircle className="w-3 h-3" />
                      {scan.totalFindings} findings · {scan.criticalCount} Critical · {scan.highCount} High
                    </span>
                  ) : scan.totalFindings > 0 ? (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <AlertCircle className="w-3 h-3" />
                      {scan.totalFindings} findings
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      No issues
                    </span>
                  )}
                  
                  <span className="text-gray-500">·</span>
                  
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(scan.createdAt)}
                  </span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>

      {scans.length > 3 && (
        <Link
          href="/dashboard/scans"
          className="block mt-4 text-center text-sm text-gray-400 hover:text-purple-400 transition-colors"
        >
          View {scans.length - 3} more {scans.length - 3 === 1 ? 'scan' : 'scans'}
        </Link>
      )}
    </div>
  )
}
