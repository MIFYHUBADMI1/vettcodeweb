/**
 * useProfile Hook
 * Centralized hook for fetching and managing user profile data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { queryKeys } from '@/lib/query-config'

interface ProfileData {
  profile: {
    id: string
    email: string
    name?: string
    image?: string
    plan: string
    emailVerified: boolean
    emailVerifiedAt?: string
    provider?: string
    createdAt: string
    lastLoginAt?: string
    scanCount: number
  }
}

interface Device {
  id: string
  deviceName: string
  platform?: string
  hostname?: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string
}

interface DevicesData {
  devices: Device[]
}

/**
 * Fetch profile data
 */
async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch('/api/account/profile')
  
  if (!response.ok) {
    throw new Error('Failed to load profile')
  }
  
  return response.json()
}

/**
 * Fetch connected devices
 */
async function fetchDevices(): Promise<DevicesData> {
  const response = await fetch('/api/account/devices')
  
  if (!response.ok) {
    throw new Error('Failed to load devices')
  }
  
  return response.json()
}

/**
 * Revoke device
 */
async function revokeDevice(deviceId: string): Promise<void> {
  const response = await fetch(`/api/account/devices/${deviceId}/revoke`, {
    method: 'POST',
  })
  
  if (!response.ok) {
    throw new Error('Failed to revoke device')
  }
}

/**
 * Hook for profile data
 */
export function useProfile() {
  const { data: session } = useSession()
  const userId = session?.user?.email // Using email as unique identifier
  
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: fetchProfile,
    enabled: !!session?.user, // Only fetch when authenticated
  })
}

/**
 * Hook for connected devices
 */
export function useDevices() {
  const { data: session } = useSession()
  const userId = session?.user?.email
  
  return useQuery({
    queryKey: queryKeys.devices(userId),
    queryFn: fetchDevices,
    enabled: !!session?.user,
  })
}

/**
 * Hook for revoking a device
 */
export function useRevokeDevice() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.email
  
  return useMutation({
    mutationFn: revokeDevice,
    onSuccess: () => {
      // Invalidate devices query to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.devices(userId) })
    },
  })
}
