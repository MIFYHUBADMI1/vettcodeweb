/**
 * Vibe Project Single File API
 * GET    /api/vibe/projects/[id]/files/[...path] - Get file content
 * PATCH  /api/vibe/projects/[id]/files/[...path] - Update file content
 * DELETE /api/vibe/projects/[id]/files/[...path] - Delete file
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { getFile, updateFile, deleteFile } from '@/lib/services/vibe-file-service';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string; path: string[] } }
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
    
    const filePath = params.path.join('/');
    const file = await getFile(params.id, session.user.email, filePath);
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    return NextResponse.json({ file });
  } catch (error) {
    console.error('Failed to fetch file:', error);
    return NextResponse.json(
      { error: 'Failed to load file' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; path: string[] } }
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
    
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'File content is required' },
        { status: 400 }
      );
    }
    
    const filePath = params.path.join('/');
    
    const file = await updateFile({
      projectId: params.id,
      userId: session.user.email,
      path: filePath,
      content: body.content,
      editedBy: body.editedBy || 'user',
    });
    
    return NextResponse.json({ file });
  } catch (error) {
    console.error('Failed to update file:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; path: string[] } }
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
    
    const filePath = params.path.join('/');
    
    const success = await deleteFile(params.id, session.user.email, filePath);
    
    if (!success) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
