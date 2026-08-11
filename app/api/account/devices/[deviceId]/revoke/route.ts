/**
 * Revoke Device API
 * POST /api/account/devices/[deviceId]/revoke
 * 
 * Revokes a specific CLI device credential
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CLICredentialModel } from '@/lib/models/CLICredential'
import { ObjectId } from 'mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { deviceId } = params

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    // Verify the device belongs to this user
    const credentials = await CLICredentialModel.findByUserId(session.user.id)
    const deviceExists = credentials.some(
      (cred) => cred._id?.toString() === deviceId
    )

    if (!deviceExists) {
      return NextResponse.json(
        { error: 'Device not found or does not belong to you' },
        { status: 404 }
      )
    }

    // Revoke the credential
    const revoked = await CLICredentialModel.revokeById(deviceId)

    if (!revoked) {
      return NextResponse.json(
        { error: 'Device is already revoked or not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Device revoked successfully',
    })
  } catch (error: any) {
    console.error('Revoke device API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to revoke device' },
      { status: 500 }
    )
  }
}
