/**
 * Build Status API
 * GET /api/vibe/builds/[sessionId]/status
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeBuildOrchestrator } from '@/lib/services/vibe-build-orchestrator';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create orchestrator
    const orchestrator = new VibeBuildOrchestrator();
    
    // Get status
    const status = await orchestrator.getStatus(params.sessionId, session.user.email);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to get build status:', error);
    
    if (error instanceof Error && error.message === 'Build session not found') {
      return NextResponse.json(
        { error: 'Build session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get build status' },
      { status: 500 }
    );
  }
}
