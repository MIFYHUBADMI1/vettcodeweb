/**
 * CLI Authentication - Get Current User
 * GET /api/cli/auth/me
 * 
 * Returns information about the authenticated CLI user
 * Requires Bearer token authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateCLIRequest } from '@/lib/cli-auth'
import { UserModel } from '@/lib/models/User'

// Mark as dynamic route (not statically renderable)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Authenticate CLI request
    const auth = await authenticateCLIRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user details
    const user = await UserModel.findById(auth.userId!)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user information (excluding sensitive fields)
    return NextResponse.json({
      user: {
        id: user._id?.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan,
        emailVerified: !!user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        scanCount: user.scanCount || 0,
      },
    })
  } catch (error: any) {
    console.error('CLI auth me error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get user information' },
      { status: 500 }
    )
  }
}
