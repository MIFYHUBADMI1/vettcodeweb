/**
 * Vibe Project Detail API
 * GET    /api/vibe/projects/[id] - Get project details
 * PATCH  /api/vibe/projects/[id] - Update project
 * DELETE /api/vibe/projects/[id] - Archive project
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel, ProjectStatus } from '@/lib/models/VibeProject';
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
    
    const project = await VibeProjectModel.findById(params.id, session.user.email);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json(
      { error: 'Failed to load project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate updates
    const updates: any = {};
    
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length < 3) {
        return NextResponse.json(
          { error: 'Project name must be at least 3 characters' },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }
    
    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return NextResponse.json(
          { error: 'Invalid description' },
          { status: 400 }
        );
      }
      updates.description = body.description.trim();
    }
    
    if (body.framework !== undefined) {
      updates.framework = body.framework;
    }
    
    if (body.status !== undefined) {
      const validStatuses: ProjectStatus[] = ['planning', 'active', 'archived'];
      if (!validStatuses.includes(body.status as ProjectStatus)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }
    
    if (body.plan !== undefined) {
      updates.plan = body.plan;
    }
    
    if (body.deploymentUrl !== undefined) {
      updates.deploymentUrl = body.deploymentUrl;
    }
    
    const project = await VibeProjectModel.update(
      params.id,
      session.user.email,
      updates
    );
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const success = await VibeProjectModel.archive(params.id, session.user.email);
    
    if (!success) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to archive project:', error);
    return NextResponse.json(
      { error: 'Failed to archive project' },
      { status: 500 }
    );
  }
}
