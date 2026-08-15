/**
 * API Route: Approve Plan and Continue Build
 * POST /api/vibe/projects/[id]/plan/approve
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { BuildSessionModel } from '@/lib/models/BuildSession';
import { VibeBuildOrchestrator } from '@/lib/services/vibe-build-orchestrator';
import { ObjectId } from 'mongodb';

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

    // Get active build session
    const buildSession = await BuildSessionModel.getActiveSession(
      new ObjectId(projectId),
      session.user.email
    );

    if (!buildSession) {
      return NextResponse.json(
        { error: 'No active build session found' },
        { status: 404 }
      );
    }

    // Check if plan exists
    if (!buildSession.artifacts.plan) {
      return NextResponse.json(
        { error: 'No plan to approve' },
        { status: 400 }
      );
    }

    // Mark plan as approved
    await BuildSessionModel.update(buildSession._id, session.user.email, {
      'artifacts.planApproved': true,
      'artifacts.planApprovedAt': new Date(),
    });

    // Continue the build in background (non-blocking)
    // We create a new orchestrator instance and continue from where we left off
    const orchestrator = new VibeBuildOrchestrator();
    
    // Load the session context and continue
    // This happens asynchronously
    continueBuildAfterApproval(buildSession._id.toString(), session.user.email).catch(error => {
      console.error('[API] Failed to continue build:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Plan approved successfully',
      sessionId: buildSession._id.toString(),
    });
  } catch (error) {
    console.error('[API] Approve plan error:', error);
    return NextResponse.json(
      { error: 'Failed to approve plan' },
      { status: 500 }
    );
  }
}

// Helper function to continue build
async function continueBuildAfterApproval(sessionId: string, userId: string) {
  try {
    const orchestrator = new VibeBuildOrchestrator();
    // Note: This is a simplified version
    // The actual orchestrator needs to reload context and continue
    // For now, we'll need to add a method to VibeBuildOrchestrator to resume
    console.log('[API] Continuing build for session:', sessionId);
    
    // TODO: Implement orchestrator.resumeFromApproval(sessionId, userId);
  } catch (error) {
    console.error('[API] Error continuing build:', error);
    throw error;
  }
}
