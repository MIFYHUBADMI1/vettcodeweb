/**
 * Vibe Project Files API
 * GET  /api/vibe/projects/[id]/files - List all files
 * POST /api/vibe/projects/[id]/files - Create new file
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { createFile, getProjectFiles } from '@/lib/services/vibe-file-service';
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
    
    const files = await getProjectFiles(params.id, session.user.email);
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Failed to fetch files:', error);
    return NextResponse.json(
      { error: 'Failed to load files' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    
    const body = await request.json();
    
    if (!body.path || typeof body.path !== 'string') {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }
    
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'File content is required' },
        { status: 400 }
      );
    }
    
    const file = await createFile({
      projectId: params.id,
      userId: session.user.email,
      path: body.path.trim(),
      content: body.content,
      editedBy: body.editedBy || 'user',
    });
    
    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    console.error('Failed to create file:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    );
  }
}
