import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/lib/models/User'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user by token
    const user = await UserModel.findByVerificationToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Verify email
    await UserModel.verifyEmail(user._id!.toString())

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    })
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    )
  }
}
