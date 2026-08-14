/**
 * VettCode Vibe AI Service
 * Handles AI orchestration for Vibe Coder
 * Reuses existing AI Router infrastructure
 */

import { routeAIRequest } from '../ai-router';
import { ProjectType, ProjectPlan } from '../models/VibeProject';
import { AIAction, ActionType } from '../models/VibeConversation';
import { ObjectId } from 'mongodb';

export interface ProjectPlanRequest {
  description: string;
  type: ProjectType;
}

export interface CodeGenerationRequest {
  message: string;
  projectContext: {
    name: string;
    type: ProjectType;
    framework?: string;
    existingFiles: string[];
    plan?: ProjectPlan;
  };
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface CodeGenerationResponse {
  message: string;
  actions: AIAction[];
  tokens: {
    input: number;
    output: number;
    cost: number;
  };
  model: string;
  provider: string;
}

/**
 * Generate project plan from user description
 */
export async function generateProjectPlan(
  userId: string,
  request: ProjectPlanRequest
): Promise<ProjectPlan> {
  const prompt = buildPlanPrompt(request);
  
  const response = await routeAIRequest({
    userId,
    feature: 'vibe_planning',
    capability: 'reasoning',
    prompt,
    maxTokens: 1500,
  });
  
  // Parse structured plan from AI response
  const plan = parsePlanResponse(response.content, request);
  
  return plan;
}

/**
 * Generate code/files from user request
 */
export async function generateCode(
  userId: string,
  request: CodeGenerationRequest
): Promise<CodeGenerationResponse> {
  const prompt = buildCodePrompt(request);
  
  const response = await routeAIRequest({
    userId,
    feature: 'vibe_code_generation',
    capability: 'code_analysis',
    prompt,
    maxTokens: 2500,
  });
  
  // Parse actions from AI response
  const actions = parseActionsFromResponse(response.content);
  
  return {
    message: extractMessageFromResponse(response.content),
    actions,
    tokens: {
      input: response.tokensUsed?.input || 0,
      output: response.tokensUsed?.output || 0,
      cost: response.cost || 0,
    },
    model: response.model || 'unknown',
    provider: response.provider || 'unknown',
  };
}

/**
 * Build prompt for project planning
 */
function buildPlanPrompt(request: ProjectPlanRequest): string {
  return `You are a senior software architect helping a beginner plan their project.

**User's Idea**: ${request.description}
**Project Type**: ${request.type}

Create a detailed, beginner-friendly project plan. Be specific and practical.

Respond in EXACTLY this JSON format:
\`\`\`json
{
  "name": "Project Name (short, descriptive)",
  "goal": "One clear sentence describing what this project does",
  "features": [
    "Feature 1: Description",
    "Feature 2: Description"
  ],
  "pages": [
    "Page 1: Purpose",
    "Page 2: Purpose"
  ],
  "dataRequirements": [
    "What data needs to be stored",
    "What data needs to be fetched"
  ],
  "authentication": true or false,
  "externalServices": [
    "API or service needed (or empty array)"
  ],
  "securityConsiderations": [
    "Security concern 1",
    "Security concern 2"
  ],
  "deploymentTarget": "Where this should be deployed (Vercel, Netlify, etc.)"
}
\`\`\`

Guidelines:
- Keep it simple for beginners
- Be specific (not generic)
- 3-5 core features maximum
- Focus on MVP (minimum viable product)
- Consider what's realistic for a beginner

Respond ONLY with the JSON, no other text.`;
}

/**
 * Build prompt for code generation
 */
function buildCodePrompt(request: CodeGenerationRequest): string {
  const { message, projectContext, conversationHistory } = request;
  
  let prompt = `You are an expert developer helping build: ${projectContext.name}

**Project Type**: ${projectContext.type}
${projectContext.framework ? `**Framework**: ${projectContext.framework}` : ''}

**Existing Files**:
${projectContext.existingFiles.length > 0 ? projectContext.existingFiles.map(f => `- ${f}`).join('\n') : '(No files yet)'}

`;

  if (projectContext.plan) {
    prompt += `**Project Goal**: ${projectContext.plan.goal}\n`;
    prompt += `**Features**: ${projectContext.plan.features.join(', ')}\n\n`;
  }
  
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `**Conversation History** (last 3 messages):\n`;
    conversationHistory.slice(-3).forEach(msg => {
      prompt += `${msg.role}: ${msg.content}\n`;
    });
    prompt += '\n';
  }
  
  prompt += `**User Request**: ${message}

Respond with your message to the user, followed by actions in this EXACT format:

Your explanation here...

ACTIONS:
\`\`\`json
[
  {
    "type": "create_file",
    "target": "path/to/file.ext",
    "payload": {
      "content": "file content here",
      "language": "typescript"
    }
  },
  {
    "type": "update_file",
    "target": "existing/file.ts",
    "payload": {
      "content": "updated content"
    }
  }
]
\`\`\`

**Action Types Available**:
- create_file: Create a new file
- update_file: Modify existing file
- delete_file: Remove a file
- install_dependency: Add npm package
- run_command: Execute command (use sparingly)

**Rules**:
1. Explain WHAT you're doing and WHY
2. Use relative paths (no leading /)
3. Include complete, working code
4. Follow best practices and security patterns
5. Keep files focused and modular
6. Add helpful comments for beginners
7. If no actions needed, respond without ACTIONS section

Generate code that actually works!`;

  return prompt;
}

/**
 * Parse plan from AI response
 */
function parsePlanResponse(content: string, request: ProjectPlanRequest): ProjectPlan {
  try {
    // Extract JSON from code blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[1]);
    
    // Validate structure
    return {
      goal: parsed.goal || `Build a ${request.type} application`,
      features: Array.isArray(parsed.features) ? parsed.features : [],
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      dataRequirements: Array.isArray(parsed.dataRequirements) ? parsed.dataRequirements : [],
      authentication: parsed.authentication === true,
      externalServices: Array.isArray(parsed.externalServices) ? parsed.externalServices : [],
      securityConsiderations: Array.isArray(parsed.securityConsiderations) ? parsed.securityConsiderations : [],
      deploymentTarget: parsed.deploymentTarget || 'Vercel',
    };
  } catch (error) {
    console.error('Failed to parse plan:', error);
    
    // Fallback plan
    return {
      goal: `Build a ${request.type} application: ${request.description}`,
      features: ['Core functionality', 'User interface', 'Basic styling'],
      pages: ['Home page', 'Main feature page'],
      dataRequirements: ['Basic state management'],
      authentication: false,
      externalServices: [],
      securityConsiderations: ['Input validation', 'Secure data handling'],
      deploymentTarget: 'Vercel',
    };
  }
}

/**
 * Parse actions from AI response
 */
function parseActionsFromResponse(content: string): AIAction[] {
  try {
    // Look for ACTIONS: section
    const actionsMatch = content.match(/ACTIONS:\s*```json\s*([\s\S]*?)\s*```/);
    if (!actionsMatch) {
      return []; // No actions in this response
    }
    
    const parsed = JSON.parse(actionsMatch[1]);
    if (!Array.isArray(parsed)) {
      return [];
    }
    
    // Convert to AIAction format
    return parsed.map(action => ({
      id: new ObjectId().toString(),
      type: action.type as ActionType,
      target: action.target,
      payload: action.payload,
      status: 'pending' as const,
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error('Failed to parse actions:', error);
    return [];
  }
}

/**
 * Extract message from response (remove actions section)
 */
function extractMessageFromResponse(content: string): string {
  // Remove ACTIONS section
  const withoutActions = content.replace(/ACTIONS:\s*```json[\s\S]*```/g, '');
  return withoutActions.trim();
}

/**
 * Validate action safety
 */
export function validateAction(action: AIAction): { safe: boolean; reason?: string } {
  // Check file operations
  if (action.type === 'create_file' || action.type === 'update_file') {
    const path = action.target;
    
    // Must not contain dangerous patterns
    if (path.includes('..') || path.startsWith('/') || path.includes('~')) {
      return { safe: false, reason: 'Unsafe file path' };
    }
    
    // Must not be system files
    const dangerous = ['.env', '.git', 'node_modules', '.ssh', 'package-lock.json'];
    if (dangerous.some(pattern => path.includes(pattern))) {
      return { safe: false, reason: 'Cannot modify system/sensitive files' };
    }
  }
  
  // Check commands
  if (action.type === 'run_command') {
    const command = action.target.toLowerCase();
    
    // Whitelist safe commands
    const allowed = ['npm install', 'npm run', 'yarn add', 'yarn build'];
    if (!allowed.some(cmd => command.startsWith(cmd))) {
      return { safe: false, reason: 'Command not allowed' };
    }
  }
  
  return { safe: true };
}
