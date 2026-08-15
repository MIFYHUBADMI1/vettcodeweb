/**
 * Build Activities API
 * GET /api/vibe/builds/[sessionId]/activities
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BuildActivityModel } from '@/lib/models/BuildActivity';
import { BuildSessionModel } from '@/lib/models/BuildSession';
import { ObjectId } from 'mongodb';
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
    
    // Verify session access
    const buildSession = await BuildSessionModel.findById(
      new ObjectId(params.sessionId),
      session.user.email
    );
    
    if (!buildSession) {
      return NextResponse.json(
        { error: 'Build session not found' },
        { status: 404 }
      );
    }
    
    // Get query params
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Get activities
    const activities = await BuildActivityModel.getBySession(
      new ObjectId(params.sessionId),
      {
        since: since ? new Date(since) : undefined,
        limit,
      }
    );
    
    return NextResponse.json({
      activities,
      hasMore: activities.length === limit,
    });
  } catch (error) {
    console.error('Failed to get build activities:', error);
    
    return NextResponse.json(
      { error: 'Failed to get build activities' },
      { status: 500 }
    );
  }
}
