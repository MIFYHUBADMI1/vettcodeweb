/**
 * CLI Authentication - Verify/Approve Authorization
 * POST /api/cli/auth/verify
 * 
 * Called by the web frontend when user approves CLI access
 * Requires authenticated user session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthorizationSessionModel } from '@/lib/models/AuthorizationSession'
import { CLICredentialModel } from '@/lib/models/CLICredential'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to authorize CLI access' },
        { status: 401 }
      )
    }

    const { sessionId, deviceName } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Find the authorization session
    const authSession = await AuthorizationSessionModel.findBySessionId(sessionId)

    if (!authSession) {
      return NextResponse.json(
        { error: 'Authorization session not found' },
        { status: 404 }
      )
    }

    if (authSession.status !== 'pending') {
      return NextResponse.json(
        { error: `Authorization session is ${authSession.status}` },
        { status: 400 }
      )
    }

    if (new Date() > authSession.expiresAt) {
      return NextResponse.json(
        { error: 'Authorization session has expired' },
        { status: 400 }
      )
    }

    // Generate CLI credential
    const { token, credential } = await CLICredentialModel.create(
      session.user.id,
      deviceName || authSession.deviceInfo?.platform || 'Unknown Device',
      authSession.deviceInfo,
      90 // 90 days expiration
    )

    // Approve the authorization session
    const approved = await AuthorizationSessionModel.approve(
      sessionId,
      session.user.id,
      token
    )

    if (!approved) {
      return NextResponse.json(
        { error: 'Failed to approve authorization' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'CLI access authorized successfully',
      credential: {
        id: credential._id?.toString(),
        deviceName: credential.deviceName,
        expiresAt: credential.expiresAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('CLI auth verify error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to authorize CLI access' },
      { status: 500 }
    )
  }
}
