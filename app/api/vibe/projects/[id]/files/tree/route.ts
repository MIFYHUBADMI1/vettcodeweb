/**
 * Vibe Project File Tree API
 * GET /api/vibe/projects/[id]/files/tree - Get file tree structure
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { getFileTree } from '@/lib/services/vibe-file-service';
import { NextResponse } from 'next/server';

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
    
    const tree = await getFileTree(params.id, session.user.email);
    
    return NextResponse.json({ tree });
  } catch (error) {
    console.error('Failed to fetch file tree:', error);
    return NextResponse.json(
      { error: 'Failed to load file tree' },
      { status: 500 }
    );
  }
}
