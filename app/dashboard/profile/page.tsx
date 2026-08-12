/**
 * Profile / Account Page
 * /dashboard/profile
 * 
 * Displays user profile, authentication methods, and connected CLI devices
 */

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import RefreshButton from '@/components/RefreshButton'
import { useProfile, useDevices, useRevokeDevice } from '@/lib/hooks/useProfile'
import { 
  User, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Laptop,
  Trash2,
  Shield,
  Key,
  AlertTriangle
} from 'lucide-react'

interface Device {
  id: string
  deviceName: string
  platform?: string
  hostname?: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch: refetchProfile, dataUpdatedAt: profileUpdatedAt } = useProfile()
  const { data: devicesData, isLoading: devicesLoading, error: devicesError, refetch: refetchDevices, dataUpdatedAt: devicesUpdatedAt } = useDevices()
  const revokeDeviceMutation = useRevokeDevice()
  
  const [deviceToRevoke, setDeviceToRevoke] = useState<Device | null>(null)

  const profile = profileData?.profile
  const devices = devicesData?.devices || []
  const loading = profileLoading || devicesLoading
  const error = profileError || devicesError

  const handleRefresh = async () => {
    await Promise.all([refetchProfile(), refetchDevices()])
  }

  const handleRevokeDevice = async (device: Device) => {
    if (!device) return

    try {
      await revokeDeviceMutation.mutateAsync(device.id)
      setDeviceToRevoke(null)
    } catch (err: any) {
      alert(err.message || 'Failed to revoke device')
    }
  }

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
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getPlatformIcon = (platform?: string) => {
    if (!platform) return '💻'
    if (platform.includes('win')) return '🪟'
    if (platform.includes('darwin') || platform.includes('mac')) return '🍎'
    if (platform.includes('linux')) return '🐧'
    return '💻'
  }

  const getUserInitials = () => {
    if (!session?.user?.name && !session?.user?.email) return 'U'
    const name = session.user.name || session.user.email || 'U'
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400">
              Manage your account settings and connected devices
            </p>
          </div>
          
          {/* Refresh Button */}
          {!loading && profile && (
            <RefreshButton 
              onRefresh={handleRefresh}
              isRefreshing={profileLoading || devicesLoading}
              lastUpdated={new Date(Math.max(profileUpdatedAt, devicesUpdatedAt))}
            />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 animate-pulse">
              <div className="h-24 bg-gray-700 rounded-lg" />
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 animate-pulse">
              <div className="h-32 bg-gray-700 rounded-lg" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
            <p className="font-medium">Error loading profile</p>
            <p className="text-sm mt-1">{error.message || 'Failed to load account data'}</p>
            <button
              onClick={handleRefresh}
              disabled={profileLoading || devicesLoading}
              className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Profile Content */}
        {profile && !loading && (
          <div className="space-y-6">
            {/* Profile Header Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  {getUserInitials()}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {profile.name || 'User'}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-300 mb-3">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {profile.emailVerified ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-400">Email verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-400">Email not verified</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {formatDate(profile.createdAt)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-6">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {profile.plan.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400">Plan</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {profile.scanCount}
                      </div>
                      <div className="text-xs text-gray-400">Scans</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication Methods Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                Sign-in Methods
              </h3>

              <div className="space-y-3">
                {/* Google OAuth */}
                {profile.provider === 'google' && (
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-white">Google</div>
                        <div className="text-sm text-gray-400">OAuth authentication</div>
                      </div>
                    </div>
                    <span className="flex items-center gap-2 text-sm text-green-400 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </span>
                  </div>
                )}

                {/* Email & Password */}
                {profile.provider === 'credentials' && (
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Email & Password</div>
                        <div className="text-sm text-gray-400">Credentials authentication</div>
                      </div>
                    </div>
                    <span className="flex items-center gap-2 text-sm text-green-400 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Enabled
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Connected Devices Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Laptop className="w-5 h-5 text-purple-400" />
                Connected Devices
              </h3>

              {devices.length === 0 ? (
                <div className="text-center py-12">
                  <Laptop className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No connected devices</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Your VettCode CLI installations will appear here after you sign in
                  </p>
                  <a
                    href="https://vettedcodewe.vercel.app/cli/auth"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Laptop className="w-4 h-4" />
                    Connect VettCode CLI
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-start justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl mt-1">
                          {getPlatformIcon(device.platform)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white mb-1">
                            {device.deviceName}
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>VettCode CLI</div>
                            {device.hostname && (
                              <div className="text-xs text-gray-500">
                                {device.hostname}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs">
                              <span>
                                Last used: {getRelativeTime(device.lastUsedAt)}
                              </span>
                              <span>Connected: {formatDate(device.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeviceToRevoke(device)}
                        disabled={revokeDeviceMutation.isPending && revokeDeviceMutation.variables === device.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        {revokeDeviceMutation.isPending && revokeDeviceMutation.variables === device.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Security Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Account Security
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Email verification</span>
                  <span className="text-white font-medium">
                    {profile.emailVerified ? '✓ Verified' : '⚠ Not verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Sign-in methods</span>
                  <span className="text-white font-medium">1 connected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">CLI devices</span>
                  <span className="text-white font-medium">
                    {devices.length} connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Confirmation Modal */}
        {deviceToRevoke && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Revoke CLI Access?
                  </h3>
                  <p className="text-gray-400 text-sm">
                    This will disconnect <strong>{deviceToRevoke.deviceName}</strong> from your
                    VettCode account. The CLI will need to be signed in again to access your
                    account.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeviceToRevoke(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRevokeDevice(deviceToRevoke)}
                  disabled={revokeDeviceMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {revokeDeviceMutation.isPending ? 'Revoking...' : 'Revoke Access'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
