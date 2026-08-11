import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/lib/models/User'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserModel.findByEmail(email)

    if (!user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.',
      })
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Update token
    await UserModel.setVerificationToken(user._id!.toString(), verificationToken, 24)

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`
    await sendVerificationEmail(email, verificationUrl)

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    })
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}
