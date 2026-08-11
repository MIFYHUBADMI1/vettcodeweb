/**
 * CLI Authorization Page
 * /cli/auth?session=xxx
 * 
 * User authorizes CLI device access
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Shield, Terminal, Check, X, Loader2, AlertCircle } from 'lucide-react'

type AuthState = 'loading' | 'not-authenticated' | 'ready' | 'authorizing' | 'success' | 'error' | 'expired'

function CLIAuthContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [error, setError] = useState<string>('')
  const [deviceName, setDeviceName] = useState('')

  const sessionId = searchParams.get('session')

  useEffect(() => {
    if (status === 'loading') {
      setAuthState('loading')
    } else if (status === 'unauthenticated') {
      setAuthState('not-authenticated')
    } else if (status === 'authenticated' && sessionId) {
      setAuthState('ready')
    } else if (!sessionId) {
      setAuthState('error')
      setError('Missing authorization session ID')
    }
  }, [status, sessionId])

  const handleSignIn = () => {
    signIn('google', {
      callbackUrl: `/cli/auth?session=${sessionId}`,
    })
  }

  const handleSignInEmail = () => {
    router.push(`/signin?callbackUrl=/cli/auth?session=${sessionId}`)
  }

  const handleAuthorize = async () => {
    if (!sessionId) return

    setAuthState('authorizing')
    setError('')

    try {
      const response = await fetch('/api/cli/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          deviceName: deviceName || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authorize CLI')
      }

      setAuthState('success')
    } catch (err: any) {
      setAuthState('error')
      setError(err.message || 'Failed to authorize CLI access')
    }
  }

  const handleDeny = () => {
    router.push('/dashboard')
  }

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - prompt sign in
  if (authState === 'not-authenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-2xl mb-4">
                <Terminal className="w-8 h-8 text-purple-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Sign in to VettCode
              </h1>
              <p className="text-gray-400">
                Sign in to authorize VettCode CLI
              </p>
            </div>

            {/* Sign in buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={handleSignInEmail}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
              >
                Sign in with Email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (authState === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              VettCode CLI Connected
            </h1>
            <p className="text-gray-400 mb-6">
              You can return to your terminal.
            </p>
            <p className="text-sm text-gray-500">
              You can safely close this window.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (authState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Authorization Failed
            </h1>
            <p className="text-gray-400 mb-6">
              {error || 'Something went wrong'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Ready to authorize
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-2xl mb-4">
              <Terminal className="w-8 h-8 text-purple-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Connect VettCode CLI
            </h1>
            <p className="text-gray-400">
              VettCode CLI wants permission to access your account
            </p>
          </div>

          {/* User info */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-sm text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-2 border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400 mb-2">This will allow the CLI to:</p>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Scan your projects for security issues</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>View and manage scan results</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Access AI-powered explanations</span>
              </div>
            </div>
          </div>

          {/* Optional device name */}
          <div className="mb-6">
            <label htmlFor="deviceName" className="block text-sm text-gray-400 mb-2">
              Device name (optional)
            </label>
            <input
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., Work Laptop, Home PC"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={authState === 'authorizing'}
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAuthorize}
              disabled={authState === 'authorizing'}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              {authState === 'authorizing' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authorizing...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Allow CLI Access
                </>
              )}
            </button>

            <button
              onClick={handleDeny}
              disabled={authState === 'authorizing'}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Security note */}
          <div className="mt-6 flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              This will create a secure connection between your terminal and VettCode.
              You can revoke access anytime from your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CLIAuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    }>
      <CLIAuthContent />
    </Suspense>
  )
}
