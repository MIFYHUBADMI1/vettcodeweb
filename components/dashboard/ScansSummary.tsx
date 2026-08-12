/**
 * Scans Summary Component
 * Displays aggregate statistics for security scans
 */

'use client'

import { Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

interface Scan {
  id: string
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  totalFindings: number
  createdAt: string
}

interface ScansSummaryProps {
  scans: Scan[]
}

export default function ScansSummary({ scans }: ScansSummaryProps) {
  // Calculate summary statistics
  const totalScans = scans.length
  const secureScans = scans.filter(
    (s) => s.criticalCount === 0 && s.highCount === 0
  ).length
  const criticalIssues = scans.reduce((sum, s) => sum + s.criticalCount, 0)
  const highIssues = scans.reduce((sum, s) => sum + s.highCount, 0)
  const scansNeedingAttention = scans.filter(
    (s) => s.criticalCount > 0 || s.highCount > 0
  ).length
  
  const lastScan = scans[0]?.createdAt
    ? new Date(scans[0].createdAt)
    : null

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Scans */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{totalScans}</div>
            <div className="text-sm text-gray-400">Total Scans</div>
          </div>
        </div>
      </div>

      {/* Secure Scans */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{secureScans}</div>
            <div className="text-sm text-gray-400">Secure Scans</div>
          </div>
        </div>
        {totalScans > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {Math.round((secureScans / totalScans) * 100)}% of total
          </div>
        )}
      </div>

      {/* Scans Needing Attention */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">
              {scansNeedingAttention}
            </div>
            <div className="text-sm text-gray-400">Need Attention</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {criticalIssues + highIssues} critical/high issues
        </div>
      </div>

      {/* Last Scan */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {lastScan ? getRelativeTime(lastScan) : 'Never'}
            </div>
            <div className="text-sm text-gray-400">Last Scan</div>
          </div>
        </div>
        {lastScan && (
          <div className="mt-2 text-xs text-gray-500">
            {lastScan.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        )}
      </div>
    </div>
  )
}
