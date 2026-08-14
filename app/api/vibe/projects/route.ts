/**
 * Vibe Projects API
 * GET  /api/vibe/projects - List user's projects
 * POST /api/vibe/projects - Create new project
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel, ProjectType } from '@/lib/models/VibeProject';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const projects = await VibeProjectModel.getUserProjects(session.user.email);
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate input
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }
    
    if (!body.description || typeof body.description !== 'string') {
      return NextResponse.json({ error: 'Project description is required' }, { status: 400 });
    }
    
    if (!body.type || typeof body.type !== 'string') {
      return NextResponse.json({ error: 'Project type is required' }, { status: 400 });
    }
    
    const validTypes: ProjectType[] = ['web', 'mobile', 'game', 'api', 'other'];
    if (!validTypes.includes(body.type as ProjectType)) {
      return NextResponse.json({ error: 'Invalid project type' }, { status: 400 });
    }
    
    // Trim and validate lengths
    const name = body.name.trim();
    const description = body.description.trim();
    
    if (name.length < 3 || name.length > 100) {
      return NextResponse.json(
        { error: 'Project name must be between 3 and 100 characters' },
        { status: 400 }
      );
    }
    
    if (description.length < 10 || description.length > 500) {
      return NextResponse.json(
        { error: 'Project description must be between 10 and 500 characters' },
        { status: 400 }
      );
    }
    
    // Create project
    const project = await VibeProjectModel.create({
      userId: session.user.email,
      name,
      description,
      type: body.type as ProjectType,
      framework: body.framework,
    });
    
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
