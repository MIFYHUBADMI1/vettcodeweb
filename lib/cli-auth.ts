/**
 * CLI Authentication Utilities
 * Middleware and utilities for authenticating CLI requests
 */

import { NextRequest } from 'next/server'
import { CLICredentialModel } from './models/CLICredential'
import { UserModel } from './models/User'

export interface CLIAuthResult {
  authenticated: boolean
  userId?: string
  email?: string
  error?: string
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
}

/**
 * Authenticate a CLI request using Bearer token
 * Returns user information if valid
 */
export async function authenticateCLIRequest(
  request: NextRequest
): Promise<CLIAuthResult> {
  try {
    const token = extractBearerToken(request)

    if (!token) {
      return {
        authenticated: false,
        error: 'Missing authorization token',
      }
    }

    // Find credential by token
    const credential = await CLICredentialModel.findByToken(token)

    if (!credential) {
      return {
        authenticated: false,
        error: 'Invalid or expired token',
      }
    }

    // Update last used timestamp (async, don't wait)
    CLICredentialModel.updateLastUsed(credential._id!).catch((err) => {
      console.error('Failed to update credential last used:', err)
    })

    // Get user information
    const user = await UserModel.findById(credential.userId.toString())

    if (!user) {
      return {
        authenticated: false,
        error: 'User not found',
      }
    }

    return {
      authenticated: true,
      userId: user._id!.toString(),
      email: user.email,
    }
  } catch (error) {
    console.error('CLI authentication error:', error)
    return {
      authenticated: false,
      error: 'Authentication failed',
    }
  }
}

/**
 * Require CLI authentication (use in API routes)
 * Returns user ID or throws error
 */
export async function requireCLIAuth(request: NextRequest): Promise<string> {
  const auth = await authenticateCLIRequest(request)

  if (!auth.authenticated) {
    throw new Error(auth.error || 'Unauthorized')
  }

  return auth.userId!
}
