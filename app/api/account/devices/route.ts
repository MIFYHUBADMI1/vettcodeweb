/**
 * Connected Devices API
 * GET /api/account/devices
 * 
 * Returns authenticated user's connected CLI devices
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CLICredentialModel } from '@/lib/models/CLICredential'

// Mark as dynamic route (not statically renderable)
export const dynamic = 'force-dynamic'

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

    // Get user's CLI credentials
    const credentials = await CLICredentialModel.findByUserId(session.user.id)

    // Format devices
    const devices = credentials.map((cred) => ({
      id: cred._id?.toString(),
      deviceName: cred.deviceName || 'VettCode CLI',
      platform: cred.deviceInfo?.platform,
      hostname: cred.deviceInfo?.hostname,
      createdAt: cred.createdAt.toISOString(),
      lastUsedAt: cred.lastUsedAt.toISOString(),
      expiresAt: cred.expiresAt.toISOString(),
    }))

    return NextResponse.json({
      devices,
    })
  } catch (error: any) {
    console.error('Devices API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get devices' },
      { status: 500 }
    )
  }
}
