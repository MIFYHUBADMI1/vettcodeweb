import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Create user
    const user = await UserModel.create({
      email,
      name,
      password: hashedPassword,
      plan: 'free',
      provider: 'credentials',
    })

    // Set verification token
    await UserModel.setVerificationToken(user._id!.toString(), verificationToken, 24)

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`
    await sendVerificationEmail(email, verificationUrl)

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      userId: user._id!.toString(),
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}
