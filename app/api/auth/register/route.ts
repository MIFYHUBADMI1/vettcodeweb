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
    let existingUser
    try {
      existingUser = await UserModel.findByEmail(email)
    } catch (dbError: any) {
      console.error('Database error checking existing user:', dbError)
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 500 }
      )
    }

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
    let user
    try {
      user = await UserModel.create({
        email,
        name,
        password: hashedPassword,
        plan: 'free',
        provider: 'credentials',
      })
    } catch (createError: any) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      )
    }

    // Set verification token
    try {
      await UserModel.setVerificationToken(user._id!.toString(), verificationToken, 24)
    } catch (tokenError: any) {
      console.error('Error setting verification token:', tokenError)
      // Continue anyway - user is created, they can request a new verification email
    }

    // Send verification email
    try {
      if (!process.env.NEXTAUTH_URL) {
        console.error('NEXTAUTH_URL is not set')
        return NextResponse.json({
          success: true,
          message: 'Account created! However, verification email could not be sent. Please contact support.',
          userId: user._id!.toString(),
        })
      }
      
      const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`
      await sendVerificationEmail(email, verificationUrl)
    } catch (emailError: any) {
      console.error('Error sending verification email:', emailError)
      // Return success but note email issue
      return NextResponse.json({
        success: true,
        message: 'Account created! However, we had trouble sending the verification email. Please use the "Resend" option.',
        userId: user._id!.toString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      userId: user._id!.toString(),
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
