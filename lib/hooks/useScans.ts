/**
 * useScans Hook
 * Centralized hook for fetching and managing scan data
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { queryKeys } from '@/lib/query-config'
import type { ScanResult } from '@/lib/types'

interface ScanSummary {
  id: string
  scanPath: string
  timestamp: string
  totalFindings: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  sensorsUsed: string[]
  createdAt: string
}

interface ScansData {
  scans: ScanSummary[]
}

interface ScanDetail {
  id: string
  scanPath: string
  timestamp: string
  sensorsUsed: string[]
  sensorsSkipped: string[]
  totalFindings: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  scanData: ScanResult
  createdAt: string
}

interface ScanDetailData {
  scan: ScanDetail
}

/**
 * Fetch scan list
 */
async function fetchScans(): Promise<ScansData> {
  const response = await fetch('/api/scans')
  
  if (!response.ok) {
    throw new Error('Failed to load scans')
  }
  
  return response.json()
}

/**
 * Fetch single scan detail
 */
async function fetchScan(scanId: string): Promise<ScanDetailData> {
  const response = await fetch(`/api/scans/${scanId}`)
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Scan not found')
    }
    throw new Error('Failed to load scan')
  }
  
  return response.json()
}

/**
 * Hook for scan list
 */
export function useScans() {
  const { data: session } = useSession()
  const userId = session?.user?.email
  
  return useQuery({
    queryKey: queryKeys.scans(userId),
    queryFn: fetchScans,
    enabled: !!session?.user, // Only fetch when authenticated
  })
}

/**
 * Hook for single scan detail
 */
export function useScan(scanId: string) {
  const { data: session } = useSession()
  const userId = session?.user?.email
  
  return useQuery({
    queryKey: queryKeys.scan(userId, scanId),
    queryFn: () => fetchScan(scanId),
    enabled: !!session?.user && !!scanId, // Only fetch when authenticated and scanId exists
  })
}

/**
 * Hook to manually refresh scans
 */
export function useRefreshScans() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.email
  
  return () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.scans(userId) })
  }
}

/**
 * Hook to manually refresh a single scan
 */
export function useRefreshScan(scanId: string) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.email
  
  return () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.scan(userId, scanId) })
  }
}
