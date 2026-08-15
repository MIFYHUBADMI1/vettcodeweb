/**
 * Active Build Session API
 * GET /api/vibe/projects/[id]/builds/active - Get active build session for a project
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { BuildSessionModel } from '@/lib/models/BuildSession';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project access
    const project = await VibeProjectModel.findById(params.id, session.user.email);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get active build session
    const buildSession = await BuildSessionModel.getActiveSession(
      project._id,
      session.user.email
    );

    return NextResponse.json({ session: buildSession });
  } catch (error) {
    console.error('Failed to fetch active build session:', error);
    return NextResponse.json(
      { error: 'Failed to load active build session' },
      { status: 500 }
    );
  }
}
