'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import PasswordInput from '@/components/auth/PasswordInput'
import { Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ 
            general: 'An account with this email may already exist. Try signing in instead.' 
          })
        } else if (data.error) {
          setErrors({ general: data.error })
        } else {
          setErrors({ 
            general: 'We couldn\'t create your account. Please try again.' 
          })
        }
        return
      }

      // Success - redirect to verification page
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setErrors({ 
        general: 'We couldn\'t reach VettCode. Check your connection and try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (err) {
      setErrors({ general: 'We couldn\'t connect to Google. Please try again.' })
      setIsGoogleLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Start building with VettCode.</h1>
          <p className="text-gray-400">Create your account and start turning ideas into real software.</p>
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

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          <AuthInput
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
            disabled={isLoading || isGoogleLoading}
            error={errors.name}
          />

          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            required
            disabled={isLoading || isGoogleLoading}
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            disabled={isLoading || isGoogleLoading}
            error={errors.password}
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            disabled={isLoading || isGoogleLoading}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/signin" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
