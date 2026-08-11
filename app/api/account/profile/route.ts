/**
 * Account Profile API
 * GET /api/account/profile
 * 
 * Returns authenticated user's profile information
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserModel } from '@/lib/models/User'

export async function GET() {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await UserModel.findById(session.user.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return profile (exclude sensitive fields)
    return NextResponse.json({
      profile: {
        id: user._id?.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
        emailVerified: !!user.emailVerified,
        emailVerifiedAt: user.emailVerified?.toISOString(),
        provider: user.provider,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString(),
        scanCount: user.scanCount || 0,
      },
    })
  } catch (error: any) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get profile' },
      { status: 500 }
    )
  }
}
