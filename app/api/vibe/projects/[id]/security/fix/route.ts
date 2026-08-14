/**
 * Vibe Security Fix API
 * POST /api/vibe/projects/[id]/security/fix - Generate AI fix for security finding
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { generateSecurityFix } from '@/lib/services/vibe-security-service';
import { checkQuota } from '@/lib/usage-tracking';
import { NextResponse } from 'next/server';
import type { NormalizedFinding } from '@/lib/types';

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
    
    if (!body.finding || !body.fileContent) {
      return NextResponse.json(
        { error: 'Finding and fileContent are required' },
        { status: 400 }
      );
    }
    
    const finding: NormalizedFinding = body.finding;
    const fileContent: string = body.fileContent;
    
    // Check AI quota for security fixes
    const quotaCheck = await checkQuota(session.user.email, 'vibe_security_fix');
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.reason || 'AI quota exceeded' },
        { status: 429 }
      );
    }
    
    // Generate security fix using AI
    const fix = await generateSecurityFix(
      session.user.email,
      finding,
      fileContent
    );
    
    return NextResponse.json({
      success: true,
      fix,
    });
  } catch (error) {
    console.error('Failed to generate security fix:', error);
    
    if (error instanceof Error) {
      // Check for quota errors
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: error.message },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate security fix' },
      { status: 500 }
    );
  }
}
