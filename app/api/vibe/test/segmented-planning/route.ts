/**
 * API Route: Test Segmented Planning
 * POST /api/vibe/test/segmented-planning
 * 
 * Creates a test project and runs segmented planning
 * ONLY FOR DEVELOPMENT - Remove in production
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { SegmentedPlanningOrchestrator } from '@/lib/services/segmented-planning-orchestrator';

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[TEST] Creating test project...');

    // Create test project
    const project = await VibeProjectModel.create({
      name: 'Student Expense Tracker (Test)',
      description: 'Build a simple web app that helps students track their daily expenses, categorize spending, and set monthly budgets. Students should be able to quickly add expenses, see where their money goes, and stay within budget.',
      type: 'web',
      framework: 'Next.js',
      userId: session.user.email,
    });

    console.log('[TEST] Test project created:', project._id);

    // Start segmented planning
    const orchestrator = new SegmentedPlanningOrchestrator();
    const buildSession = await orchestrator.startPlanGeneration({
      projectId: project._id.toString(),
      userId: session.user.email,
    });

    console.log('[TEST] Segmented planning started:', buildSession._id);

    return NextResponse.json({
      success: true,
      message: 'Test project created and segmented planning started',
      projectId: project._id.toString(),
      sessionId: buildSession._id.toString(),
      instructions: {
        checkProgress: `GET /api/vibe/projects/${project._id}/plan/segmented`,
        viewProject: `/dashboard/vibe/projects/${project._id}/plan`,
      },
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Test failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check test status
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    info: 'Segmented Planning Test Endpoint',
    usage: {
      createTest: 'POST /api/vibe/test/segmented-planning',
      checkProgress: 'GET /api/vibe/projects/[id]/plan/segmented',
    },
    note: 'This endpoint is for development only',
  });
}
