/**
 * CLI Authentication - Poll Authorization Status
 * POST /api/cli/auth/poll
 * 
 * CLI polls this endpoint to check if user has authorized the device
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationSessionModel } from '@/lib/models/AuthorizationSession'

// Rate limiting map (in-memory, basic protection)
const pollRateLimit = new Map<string, number>()

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now()
  const lastPoll = pollRateLimit.get(sessionId) || 0
  
  // Allow polling every 2 seconds minimum
  if (now - lastPoll < 2000) {
    return false
  }
  
  pollRateLimit.set(sessionId, now)
  
  // Cleanup old entries (older than 1 hour)
  if (pollRateLimit.size > 1000) {
    const cutoff = now - 3600000
    for (const [key, time] of pollRateLimit.entries()) {
      if (time < cutoff) {
        pollRateLimit.delete(key)
      }
    }
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Basic rate limiting
    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before polling again.' },
        { status: 429 }
      )
    }

    // Get session status
    const result = await AuthorizationSessionModel.getStatus(sessionId)

    if (!result) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Return status
    const response: any = {
      status: result.status,
    }

    // If approved, include the CLI token
    if (result.status === 'approved' && result.cliToken) {
      response.token = result.cliToken
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('CLI auth poll error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check authorization status' },
      { status: 500 }
    )
  }
}
