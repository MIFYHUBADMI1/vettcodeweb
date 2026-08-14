/**
 * Vibe Project Chat API
 * GET  /api/vibe/projects/[id]/chat - Get conversation history
 * POST /api/vibe/projects/[id]/chat - Send message to AI
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { VibeConversationModel } from '@/lib/models/VibeConversation';
import { VibeProjectFileModel } from '@/lib/models/VibeProjectFile';
import { generateCode } from '@/lib/services/vibe-ai-service';
import { checkQuota } from '@/lib/usage-tracking';
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
    
    // Get conversation messages
    const messages = await VibeConversationModel.getMessages(
      params.id,
      session.user.email
    );
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return NextResponse.json(
      { error: 'Failed to load chat history' },
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
    
    // Get project
    const project = await VibeProjectModel.findById(params.id, session.user.email);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const body = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const message = body.message.trim();
    
    if (message.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }
    
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long (max 2000 characters)' },
        { status: 400 }
      );
    }
    
    // Check AI quota
    const quotaCheck = await checkQuota(session.user.email, 'vibe_code_generation');
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.reason || 'AI quota exceeded' },
        { status: 429 }
      );
    }
    
    // Save user message
    const userMessage = await VibeConversationModel.addMessage({
      projectId: params.id,
      userId: session.user.email,
      role: 'user',
      content: message,
    });
    
    // Get project context
    const files = await VibeProjectFileModel.getProjectFiles(
      params.id,
      session.user.email
    );
    
    const existingFiles = files.map(f => f.path);
    
    // Get recent conversation history
    const recentMessages = await VibeConversationModel.getMessages(
      params.id,
      session.user.email,
      10 // Last 10 messages for context
    );
    
    const conversationHistory = recentMessages
      .filter(m => m.id !== userMessage.id) // Exclude the message we just added
      .map(m => ({
        role: m.role,
        content: m.content,
      }));
    
    // Generate AI response
    const aiResponse = await generateCode(session.user.email, {
      message,
      projectContext: {
        name: project.name,
        type: project.type,
        framework: project.framework,
        existingFiles,
        plan: project.plan,
      },
      conversationHistory,
    });
    
    // Save AI response
    const assistantMessage = await VibeConversationModel.addMessage({
      projectId: params.id,
      userId: session.user.email,
      role: 'assistant',
      content: aiResponse.message,
      actions: aiResponse.actions,
      tokens: aiResponse.tokens,
      model: aiResponse.model,
      provider: aiResponse.provider,
    });
    
    // Update project context
    await VibeConversationModel.updateContext(params.id, session.user.email, {
      framework: project.framework,
      dependencies: [], // TODO: Extract from package.json if exists
      currentFiles: existingFiles,
      recentChanges: [`User: ${message.substring(0, 50)}...`],
    });
    
    return NextResponse.json({
      userMessage,
      assistantMessage,
      actions: aiResponse.actions,
    });
  } catch (error) {
    console.error('Failed to process chat message:', error);
    
    // Check for quota errors
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
