/**
 * Project Build Sessions API
 * GET /api/vibe/projects/[id]/builds - Get all build sessions for a project
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';
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

    // Get all build sessions for this project
    const sessions = await BuildSessionModel.getByProject(
      project._id,
      session.user.email
    );

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Failed to fetch build sessions:', error);
    return NextResponse.json(
      { error: 'Failed to load build sessions' },
      { status: 500 }
    );
  }
}
