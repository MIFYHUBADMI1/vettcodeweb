/**
 * Dashboard Content Component
 * Integrates security, AI usage, and quick actions into the main dashboard
 * This component fetches data client-side and integrates with existing systems
 */

'use client'

import { useScans } from '@/lib/hooks/useScans'
import { useState, useEffect } from 'react'
import RecentScansCard from './RecentScansCard'
import SecurityOverviewCard from './SecurityOverviewCard'
import AIUsageCard from './AIUsageCard'
import QuickActionsCard from './QuickActionsCard'
import WorkspaceStats from './WorkspaceStats'

interface DashboardContentProps {
  userId: string
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const { data: scansData, isLoading: scansLoading } = useScans()
  const [usageData, setUsageData] = useState<any>(null)
  const [usageLoading, setUsageLoading] = useState(true)

  const scans = scansData?.scans || []

  // Calculate security status from scans
  const getSecurityStatus = (): 'none' | 'unknown' | 'secure' | 'issues' => {
    if (scans.length === 0) return 'none'
    
    const hasCritical = scans.some(s => s.criticalCount > 0)
    const hasHigh = scans.some(s => s.highCount > 0)
    const hasAnyIssues = scans.some(s => s.totalFindings > 0)
    
    if (hasCritical || hasHigh) return 'issues'
    if (hasAnyIssues) return 'issues'
    return 'secure'
  }

  // Fetch AI usage data
  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch(`/api/usage?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setUsageData(data)
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      } finally {
        setUsageLoading(false)
      }
    }

    if (userId) {
      fetchUsage()
    }
  }, [userId])

  return (
    <div className="space-y-6">
      {/* Workspace Stats - Now with real scan data */}
      <WorkspaceStats
        projectCount={0} // TODO: Real project count when backend ready
        securityStatus={getSecurityStatus()}
        deploymentCount={0}
        scanCount={scans.length}
        isLoading={scansLoading}
      />

      {/* Quick Actions - Always visible */}
      <QuickActionsCard />

      {/* Two Column Layout for Security & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Overview */}
        <SecurityOverviewCard scans={scans} isLoading={scansLoading} />

        {/* AI Usage */}
        {usageData && (
          <AIUsageCard
            usage={usageData.usage}
            plan={usageData.plan}
            isLoading={usageLoading}
          />
        )}
        
        {usageLoading && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-2 bg-gray-700 rounded w-full mb-4" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
          </div>
        )}
      </div>

      {/* Recent Security Activity */}
      <RecentScansCard scans={scans} isLoading={scansLoading} />

      {/* VettCode Ecosystem Info - Only show if user has scans */}
      {scans.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Learn While You Build
          </h2>
          <p className="text-gray-300 mb-4">
            Not sure what a security finding means? VettCode Coach can explain your results and teach you how to fix them.
          </p>
          <a
            href={`/dashboard/scans/${scans[0]?.id}/ai`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Open VettCode Coach
          </a>
        </div>
      )}
    </div>
  )
}
