/**
 * API Route: Pause Segmented Planning
 * POST /api/vibe/projects/[id]/plan/segmented/pause
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { SegmentedPlanningOrchestrator } from '@/lib/services/segmented-planning-orchestrator';
import { BuildSessionModel } from '@/lib/models/BuildSession';
import { ObjectId } from 'mongodb';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      return NextResponse.json({ error: 'No active session' }, { status: 404 });
    }

    // Pause planning
    const orchestrator = new SegmentedPlanningOrchestrator();
    await orchestrator.pausePlanning(buildSession._id.toString(), session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Planning paused',
    });
  } catch (error) {
    console.error('[API] Pause planning error:', error);
    return NextResponse.json(
      { error: 'Failed to pause planning' },
      { status: 500 }
    );
  }
}
