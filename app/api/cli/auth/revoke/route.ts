/**
 * CLI Authentication - Revoke Token
 * POST /api/cli/auth/revoke
 * 
 * Revokes the CLI credential
 * Can be called by CLI (revokes self) or web (with session)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CLICredentialModel } from '@/lib/models/CLICredential'
import { authenticateCLIRequest } from '@/lib/cli-auth'

export async function POST(request: NextRequest) {
  try {
    // Try CLI authentication first
    const cliAuth = await authenticateCLIRequest(request)

    if (cliAuth.authenticated) {
      // CLI is revoking its own token
      const token = request.headers.get('authorization')?.split(' ')[1]

      if (!token) {
        return NextResponse.json(
          { error: 'Token not found' },
          { status: 400 }
        )
      }

      const revoked = await CLICredentialModel.revoke(token)

      if (!revoked) {
        return NextResponse.json(
          { error: 'Token already revoked or not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'CLI credential revoked successfully',
      })
    }

    // Try web session authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Web user revoking a specific credential by ID
    const { credentialId } = await request.json()

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
      )
    }

    // TODO: Verify the credential belongs to this user before revoking
    const revoked = await CLICredentialModel.revokeById(credentialId)

    if (!revoked) {
      return NextResponse.json(
        { error: 'Credential not found or already revoked' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'CLI credential revoked successfully',
    })
  } catch (error: any) {
    console.error('CLI auth revoke error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to revoke credential' },
      { status: 500 }
    )
  }
}
