/**
 * Security Overview Card
 * Shows aggregate security status from all scans
 */

'use client'

import Link from 'next/link'
import { Shield, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'

interface Scan {
  id: string
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  totalFindings: number
}

interface SecurityOverviewCardProps {
  scans: Scan[]
  isLoading?: boolean
}

export default function SecurityOverviewCard({ scans, isLoading }: SecurityOverviewCardProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded" />
          <div className="h-4 bg-gray-700 rounded" />
          <div className="h-4 bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  // Aggregate statistics from all scans
  const totalCritical = scans.reduce((sum, s) => sum + s.criticalCount, 0)
  const totalHigh = scans.reduce((sum, s) => sum + s.highCount, 0)
  const totalMedium = scans.reduce((sum, s) => sum + s.mediumCount, 0)
  const totalLow = scans.reduce((sum, s) => sum + s.lowCount, 0)
  const totalFindings = totalCritical + totalHigh + totalMedium + totalLow

  // Determine overall status
  const getStatus = () => {
    if (scans.length === 0) {
      return {
        label: 'No Scans',
        color: 'text-gray-400',
        icon: Shield,
        iconColor: 'text-gray-400',
        bgColor: 'bg-gray-600/20',
        borderColor: 'border-gray-500/30',
      }
    }
    
    if (totalCritical > 0) {
      return {
        label: 'Critical Risk',
        color: 'text-red-400',
        icon: AlertTriangle,
        iconColor: 'text-red-400',
        bgColor: 'bg-red-600/20',
        borderColor: 'border-red-500/30',
      }
    }
    
    if (totalHigh > 0) {
      return {
        label: 'Needs Attention',
        color: 'text-orange-400',
        icon: AlertTriangle,
        iconColor: 'text-orange-400',
        bgColor: 'bg-orange-600/20',
        borderColor: 'border-orange-500/30',
      }
    }
    
    if (totalMedium > 0 || totalLow > 0) {
      return {
        label: 'Good',
        color: 'text-yellow-400',
        icon: CheckCircle,
        iconColor: 'text-yellow-400',
        bgColor: 'bg-yellow-600/20',
        borderColor: 'border-yellow-500/30',
      }
    }
    
    return {
      label: 'Secure',
      color: 'text-green-400',
      icon: CheckCircle,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-500/30',
    }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  if (scans.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Security Overview</h2>
        <div className="text-center py-6">
          <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No security data yet</p>
          <p className="text-gray-500 text-xs mt-1">
            Run your first scan to see security overview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Security Overview</h2>
        <Link
          href="/dashboard/scans"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          Review
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${status.bgColor} border ${status.borderColor} mb-4`}>
        <StatusIcon className={`w-5 h-5 ${status.iconColor}`} />
        <span className={`font-semibold ${status.color}`}>{status.label}</span>
      </div>

      {/* Severity Breakdown */}
      <div className="space-y-2">
        {totalCritical > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm text-gray-300">Critical</span>
            </div>
            <span className="text-sm font-semibold text-red-400">{totalCritical}</span>
          </div>
        )}
        
        {totalHigh > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-300">High</span>
            </div>
            <span className="text-sm font-semibold text-orange-400">{totalHigh}</span>
          </div>
        )}
        
        {totalMedium > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-300">Medium</span>
            </div>
            <span className="text-sm font-semibold text-yellow-400">{totalMedium}</span>
          </div>
        )}
        
        {totalLow > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-300">Low</span>
            </div>
            <span className="text-sm font-semibold text-blue-400">{totalLow}</span>
          </div>
        )}
      </div>

      {totalFindings > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Recent scan: {totalFindings} {totalFindings === 1 ? 'issue' : 'issues'} found
          </p>
        </div>
      )}
    </div>
  )
}
