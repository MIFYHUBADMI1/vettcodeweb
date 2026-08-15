/**
 * Start Build API
 * POST /api/vibe/builds/start
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeBuildOrchestrator } from '@/lib/services/vibe-build-orchestrator';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Create orchestrator
    const orchestrator = new VibeBuildOrchestrator();
    
    // Start build
    const buildSession = await orchestrator.startBuild({
      projectId: body.projectId,
      userId: session.user.email,
      buildConfig: body.buildConfig,
    });
    
    return NextResponse.json({
      session: buildSession,
      estimated: {
        duration: buildSession.estimatedDuration || 120,
        cost: 0.01, // Rough estimate
        filesExpected: 8,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to start build:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to start build' },
      { status: 500 }
    );
  }
}
