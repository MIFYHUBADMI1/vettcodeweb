'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import PasswordInput from '@/components/auth/PasswordInput'
import { Loader2 } from 'lucide-react'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Translate error messages to user-friendly text
        if (result.error === 'Please verify your email first') {
          setError('Your email hasn\'t been verified yet. Check your inbox or resend the verification email.')
        } else if (result.error === 'No user found with this email') {
          setError('We couldn\'t find an account with that email. Check your email or create a new account.')
        } else if (result.error === 'Invalid password') {
          setError('Incorrect password. Please try again.')
        } else if (result.error === 'Please sign in with Google') {
          setError('This account uses Google sign-in. Please use the "Continue with Google" button.')
        } else {
          setError('We couldn\'t sign you in. Check your email and password and try again.')
        }
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError('We couldn\'t reach VettCode. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (err) {
      setError('We couldn\'t connect to Google. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome back.</h1>
        <p className="text-gray-400">Sign in to continue building with VettCode.</p>
      </div>

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-800"></div>
        <span className="text-sm text-gray-500">OR</span>
        <div className="flex-1 h-px bg-gray-800"></div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsSignIn} className="space-y-4">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
          disabled={isLoading || isGoogleLoading}
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          disabled={isLoading || isGoogleLoading}
        />

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      }>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  )
}
