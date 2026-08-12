/**
 * Scan Card Component
 * Enhanced display for individual security scan
 */

'use client'

import Link from 'next/link'
import { Terminal, Clock, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

interface Scan {
  id: string
  scanPath: string
  timestamp: string
  totalFindings: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  createdAt: string
}

interface ScanCardProps {
  scan: Scan
}

export default function ScanCard({ scan }: ScanCardProps) {
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

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getSecurityStatus = () => {
    if (scan.criticalCount > 0) {
      return {
        label: 'CRITICAL RISK',
        color: 'bg-red-500/10 text-red-400 border-red-500/50',
        icon: '🔴',
      }
    }
    if (scan.highCount > 0) {
      return {
        label: 'NEEDS ATTENTION',
        color: 'bg-orange-500/10 text-orange-400 border-orange-500/50',
        icon: '🟠',
      }
    }
    if (scan.mediumCount > 0 || scan.lowCount > 0) {
      return {
        label: 'GOOD',
        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
        icon: '🟡',
      }
    }
    return {
      label: 'SECURE',
      color: 'bg-green-500/10 text-green-400 border-green-500/50',
      icon: '🟢',
    }
  }

  const status = getSecurityStatus()

  return (
    <Link
      href={`/dashboard/scans/${scan.id}`}
      className="block bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 rounded-xl p-6 transition-all hover:bg-gray-800/70 group"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          {/* Project Name */}
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
              {scan.scanPath || 'Security Scan'}
            </h3>
          </div>

          {/* Security Status Badge */}
          <div
            className={clsx(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border mb-3',
              status.color
            )}
          >
            <span>{status.icon}</span>
            <span className="font-bold">{status.label}</span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
      </div>

      {/* Severity Summary */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {scan.criticalCount > 0 && (
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-400 font-medium">
              {scan.criticalCount} Critical
            </span>
          </span>
        )}
        {scan.highCount > 0 && (
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-orange-400 font-medium">
              {scan.highCount} High
            </span>
          </span>
        )}
        {scan.mediumCount > 0 && (
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-yellow-400 font-medium">
              {scan.mediumCount} Medium
            </span>
          </span>
        )}
        {scan.lowCount > 0 && (
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-blue-400 font-medium">{scan.lowCount} Low</span>
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
      <div className="flex items-center gap-4 text-sm text-gray-400 pt-3 border-t border-gray-700">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{getRelativeTime(scan.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          <span>
            <span className="font-medium text-white">{scan.totalFindings}</span>{' '}
            {scan.totalFindings === 1 ? 'finding' : 'findings'}
          </span>
        </div>
      </div>
    </Link>
  )
}
