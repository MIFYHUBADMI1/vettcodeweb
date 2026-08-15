/**
 * API Route: Reset Build Session (Development Only)
 * POST /api/vibe/projects/[id]/builds/reset
 * 
 * Resets/cancels the active build session for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { BuildSessionModel } from '@/lib/models/BuildSession';
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
        { 
          success: true,
          message: 'No active session to reset' 
        },
        { status: 200 }
      );
    }

    // Cancel the session
    await BuildSessionModel.update(buildSession._id, session.user.email, {
      status: 'cancelled',
      completedAt: new Date(),
    });

    console.log(`[RESET] Cancelled build session ${buildSession._id} for project ${projectId}`);

    return NextResponse.json({
      success: true,
      message: 'Build session reset successfully',
      sessionId: buildSession._id.toString(),
    });
  } catch (error) {
    console.error('[RESET] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
