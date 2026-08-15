/**
 * Build Tasks API
 * GET /api/vibe/builds/[sessionId]/tasks - Get tasks for a build session
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { BuildSessionModel } from '@/lib/models/BuildSession';
import { BuildTaskModel } from '@/lib/models/BuildTask';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate sessionId
    if (!ObjectId.isValid(params.sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    // Verify session access
    const buildSession = await BuildSessionModel.findById(
      new ObjectId(params.sessionId),
      session.user.email
    );

    if (!buildSession) {
      return NextResponse.json({ error: 'Build session not found' }, { status: 404 });
    }

    // Get tasks
    const tasks = await BuildTaskModel.getBySession(new ObjectId(params.sessionId));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Failed to fetch build tasks:', error);
    return NextResponse.json(
      { error: 'Failed to load build tasks' },
      { status: 500 }
    );
  }
}
