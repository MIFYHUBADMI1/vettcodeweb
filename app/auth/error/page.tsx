'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/auth/AuthLayout'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return 'There is a configuration problem. Please contact support.'
      case 'AccessDenied':
        return 'Access was denied. You may not have permission to sign in.'
      case 'Verification':
        return 'The verification link has expired or been used already.'
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
        return 'We couldn\'t complete the sign-in process. Please try again.'
      case 'OAuthAccountNotLinked':
        return 'This account is already linked with another sign-in method. Try signing in with your original method.'
      case 'EmailSignin':
        return 'We couldn\'t send the sign-in email. Please try again.'
      case 'CredentialsSignin':
        return 'We couldn\'t sign you in. Check your credentials and try again.'
      case 'SessionRequired':
        return 'You need to be signed in to access this page.'
      default:
        return 'Something went wrong during authentication. Please try again.'
    }
  }

  return (
    <AuthLayout>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-white">Something went wrong</h1>
        
        <p className="text-gray-400 mb-8">
          {getErrorMessage(error)}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signin"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold rounded-lg transition"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Back to VettCode
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
