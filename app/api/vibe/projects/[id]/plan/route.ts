/**
 * Vibe Project Plan Generation API
 * POST /api/vibe/projects/[id]/plan - Generate AI project plan
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel, ProjectType } from '@/lib/models/VibeProject';
import { generateProjectPlan } from '@/lib/services/vibe-ai-service';
import { checkQuota } from '@/lib/usage-tracking';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get project
    const project = await VibeProjectModel.findById(params.id, session.user.email);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check AI quota
    const quotaCheck = await checkQuota(session.user.email, 'vibe_planning');
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.reason || 'AI quota exceeded' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // Use provided description or project description
    const description = body.description || project.description;
    const type = body.type || project.type;
    
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }
    
    // Generate plan using AI
    const plan = await generateProjectPlan(session.user.email, {
      description,
      type: type as ProjectType,
    });
    
    // Update project with plan
    const updatedProject = await VibeProjectModel.update(
      params.id,
      session.user.email,
      { plan, status: 'active' }
    );
    
    return NextResponse.json({
      plan,
      project: updatedProject,
    });
  } catch (error) {
    console.error('Failed to generate plan:', error);
    
    // Check for quota errors
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate project plan' },
      { status: 500 }
    );
  }
}
