/**
 * API Route: Segmented Planning
 * GET  /api/vibe/projects/[id]/plan/segmented - Get segmented plan status
 * POST /api/vibe/projects/[id]/plan/segmented - Start segmented planning
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { BuildSessionModel } from '@/lib/models/BuildSession';
import { SegmentedPlanningOrchestrator } from '@/lib/services/segmented-planning-orchestrator';
import { ObjectId } from 'mongodb';

/**
 * GET - Get current segmented plan state
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    // Verify project ownership
    const project = await VibeProjectModel.findById(projectId, session.user.email);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get active build session
    const buildSession = await BuildSessionModel.getActiveSession(
      new ObjectId(projectId),
      session.user.email
    );

    if (!buildSession) {
      return NextResponse.json(
        { 
          error: 'No active build session found',
          hint: 'Start planning by POSTing to this endpoint' 
        },
        { status: 404 }
      );
    }

    const segmentedPlan = buildSession.artifacts?.segmentedPlan;
    if (!segmentedPlan) {
      return NextResponse.json(
        { 
          error: 'No segmented plan found',
          hint: 'Segmented plan not initialized. POST to this endpoint to start planning.',
          session: {
            id: buildSession._id.toString(),
            status: buildSession.status,
          }
        },
        { status: 404 }
      );
    }

    // Get progress
    const orchestrator = new SegmentedPlanningOrchestrator();
    const progress = await orchestrator.getProgress(
      buildSession._id.toString(),
      session.user.email
    );

    return NextResponse.json({
      success: true,
      plan: segmentedPlan,
      progress,
      session: buildSession,
    });
  } catch (error) {
    console.error('[API] Get segmented plan error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segmented plan' },
      { status: 500 }
    );
  }
}

/**
 * POST - Start segmented planning
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    // Verify project ownership
    const project = await VibeProjectModel.findById(projectId, session.user.email);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Start segmented planning
    const orchestrator = new SegmentedPlanningOrchestrator();
    const buildSession = await orchestrator.startPlanGeneration({
      projectId,
      userId: session.user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Segmented planning started',
      sessionId: buildSession._id.toString(),
      session: buildSession,
    });
  } catch (error) {
    console.error('[API] Start segmented planning error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
