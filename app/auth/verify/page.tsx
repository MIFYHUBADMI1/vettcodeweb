'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/auth/AuthLayout'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'

type VerificationState = 'waiting' | 'verifying' | 'success' | 'error'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [state, setState] = useState<VerificationState>('waiting')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setState('verifying')
    setMessage('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setState('success')
        setMessage(data.message || 'Email verified successfully!')
      } else {
        setState('error')
        if (response.status === 400) {
          setMessage('This verification link has expired or is invalid. Please request a new verification email.')
        } else {
          setMessage(data.error || 'We couldn\'t verify your email. Please try again.')
        }
      }
    } catch (err) {
      setState('error')
      setMessage('We couldn\'t reach VettCode. Check your connection and try again.')
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('Please provide your email address')
      return
    }

    setIsResending(true)
    setResendMessage('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('Verification email sent! Please check your inbox.')
      } else if (response.status === 400 && data.error?.includes('already verified')) {
        setResendMessage('Your email is already verified. You can sign in now.')
      } else {
        setResendMessage(data.error || 'We couldn\'t send the verification email. Please try again.')
      }
    } catch (err) {
      setResendMessage('We couldn\'t reach VettCode. Check your connection and try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
      {/* Waiting State */}
      {state === 'waiting' && (
        <>
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-white">Check your inbox</h1>
          <p className="text-gray-400 mb-8">
            We've sent a verification link to {email ? <span className="text-white font-semibold">{email}</span> : 'your email address'}.
            Click the link in the email to verify your account.
          </p>
          {email && (
            <>
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </button>
              {resendMessage && (
                <p className={`mt-4 text-sm ${resendMessage.includes('sent') || resendMessage.includes('already verified') ? 'text-green-400' : 'text-red-400'}`}>
                  {resendMessage}
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* Verifying State */}
      {state === 'verifying' && (
        <>
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-white">Verifying your email...</h1>
          <p className="text-gray-400">Please wait a moment.</p>
        </>
      )}

      {/* Success State */}
      {state === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-white">Email verified!</h1>
          <p className="text-gray-400 mb-8">
            Your account is ready. You can now sign in and start building with VettCode.
          </p>
          <Link
            href="/signin"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold rounded-lg transition"
          >
            Continue to Sign In
          </Link>
        </>
      )}

      {/* Error State */}
      {state === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-white">We couldn't verify your email</h1>
          <p className="text-gray-400 mb-8">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {email && (
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </button>
            )}
            <Link
              href="/signin"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition inline-block"
            >
              Back to Sign In
            </Link>
          </div>
          {resendMessage && (
            <p className={`mt-4 text-sm ${resendMessage.includes('sent') ? 'text-green-400' : 'text-red-400'}`}>
              {resendMessage}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white">Loading...</h1>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </AuthLayout>
  )
}
