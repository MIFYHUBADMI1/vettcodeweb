/**
 * CLI Authentication - Start Authorization Flow
 * POST /api/cli/auth/start
 * 
 * Creates a new authorization session for CLI device authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationSessionModel } from '@/lib/models/AuthorizationSession'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    
    // Extract device information from request
    const deviceInfo = {
      userAgent: request.headers.get('user-agent') || undefined,
      platform: body.platform || undefined,
      hostname: body.hostname || undefined,
    }

    // Create authorization session (expires in 15 minutes)
    const session = await AuthorizationSessionModel.create(deviceInfo, 15)

    // Build authorization URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const authorizationUrl = `${baseUrl}/cli/auth?session=${session.sessionId}`

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      verificationCode: session.verificationCode,
      authorizationUrl,
      expiresAt: session.expiresAt.toISOString(),
      expiresInSeconds: Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
    })
  } catch (error: any) {
    console.error('CLI auth start error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start authorization' },
      { status: 500 }
    )
  }
}
