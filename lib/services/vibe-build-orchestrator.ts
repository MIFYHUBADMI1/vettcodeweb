/**
 * Vibe Build Orchestrator
 * Coordinates all agents, manages build lifecycle, handles state
 */

import { ObjectId } from 'mongodb';
import { BuildSessionModel, BuildSession, BuildConfig } from '../models/BuildSession';
import { BuildTaskModel, BuildTask, AgentType } from '../models/BuildTask';
import { BuildActivityModel } from '../models/BuildActivity';
import { VibeProjectModel, VibeProject } from '../models/VibeProject';
import { getUserPlan } from '../subscription';
import { AIRouter } from '../ai-router';
import { BuildContext, IBuildAgent, AgentOutput } from '../agents/types';
import { PlannerAgent } from '../agents/planner-agent';
import { RequirementsAgent } from '../agents/requirements-agent';
import { ArchitectureAgent } from '../agents/architecture-agent';
import { UIUXAgent } from '../agents/ui-ux-agent';
import { CodeAgent } from '../agents/code-agent';
import { ReviewAgent } from '../agents/review-agent';
import { TestAgent } from '../agents/test-agent';
import { getProjectFiles, createFile } from './vibe-file-service';

export interface StartBuildRequest {
  projectId: string;
  userId: string;
  buildConfig?: Partial<BuildConfig>;
}

export interface BuildProgress {
  session: BuildSession;
  currentTask?: BuildTask;
  progress: {
    phase: string;
    percentage: number;
    tasksCompleted: number;
    tasksTotal: number;
  };
}

/**
 * Vibe Build Orchestrator
 */
export class VibeBuildOrchestrator {
  private session!: BuildSession;
  private project!: VibeProject;
  private context!: BuildContext;
  private agents: Map<AgentType, IBuildAgent>;
  private aiRouter: AIRouter;

  constructor() {
    this.aiRouter = new AIRouter();
    this.agents = new Map();
    
    // Register all 7 agents
    this.registerAgent(new PlannerAgent(this.aiRouter));
    this.registerAgent(new RequirementsAgent(this.aiRouter));
    this.registerAgent(new ArchitectureAgent(this.aiRouter));
    this.registerAgent(new UIUXAgent(this.aiRouter));
    this.registerAgent(new CodeAgent(this.aiRouter));
    this.registerAgent(new ReviewAgent(this.aiRouter));
    this.registerAgent(new TestAgent(this.aiRouter));
  }

  /**
   * Register an agent
   */
  private registerAgent(agent: IBuildAgent): void {
    this.agents.set(agent.type, agent);
    console.log(`[BUILD-ORCHESTRATOR] Registered ${agent.name}`);
  }

  /**
   * Start a new build
   */
  async startBuild(request: StartBuildRequest): Promise<BuildSession> {
    console.log(`[BUILD-ORCHESTRATOR] Starting build for project ${request.projectId}`);

    try {
      // Load project
      this.project = await this.loadProject(request.projectId, request.userId);

      // Check if there's already an active build
      const activeSession = await BuildSessionModel.getActiveSession(
        new ObjectId(request.projectId),
        request.userId
      );

      if (activeSession) {
        throw new Error('Build already in progress for this project');
      }

      // Create build session
      const buildConfig: BuildConfig = {
        autoApprove: request.buildConfig?.autoApprove ?? true,
        generateTests: request.buildConfig?.generateTests ?? false,
        runSecurityScan: request.buildConfig?.runSecurityScan ?? true,
        targetFramework: request.buildConfig?.targetFramework || this.project.framework,
        buildMode: request.buildConfig?.buildMode || 'standard',
      };

      this.session = await BuildSessionModel.create({
        projectId: new ObjectId(request.projectId),
        userId: request.userId,
        buildConfig,
      });

      // Initialize build context
      await this.initializeBuildContext(request.userId);

      // Log start activity
      await BuildActivityModel.create({
        sessionId: this.session._id,
        projectId: this.session.projectId,
        userId: request.userId,
        type: 'info',
        severity: 'info',
        title: 'Build started',
        message: `Building ${this.project.name}`,
        icon: '🚀',
        color: 'blue',
      });

      // Start build process (async, don't await)
      this.executeBuildPhases().catch(error => {
        console.error('[BUILD-ORCHESTRATOR] Build failed:', error);
        this.handleBuildError(error);
      });

      return this.session;
    } catch (error) {
      console.error('[BUILD-ORCHESTRATOR] Failed to start build:', error);
      throw error;
    }
  }

  /**
   * Load project
   */
  private async loadProject(projectId: string, userId: string): Promise<VibeProject> {
    const project = await VibeProjectModel.findById(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  /**
   * Initialize build context
   */
  private async initializeBuildContext(userId: string): Promise<void> {
    const userPlan = await getUserPlan(userId);

    this.context = {
      session: this.session,
      project: this.project,
      user: {
        email: userId,
        plan: userPlan,
      },
      generatedFiles: new Map(),
      currentPhase: 'planning',
      budget: {
        maxTokens: 50000, // 50K tokens max per build
        usedTokens: 0,
        maxCost: userPlan.monthlyAISpendLimit * 0.1, // Max 10% of monthly budget per build
        usedCost: 0,
      },
    };
  }

  /**
   * Execute build phases sequentially
   */
  private async executeBuildPhases(): Promise<void> {
    try {
      console.log('[BUILD-ORCHESTRATOR] Starting build phases');

      // Update status
      await BuildSessionModel.updateStatus(this.session._id, 'planning');

      // Phase 1: Planning
      await this.executePhase('planning', ['planner']);

      // PAUSE HERE - Wait for user approval
      // The plan is now saved in artifacts.plan
      // User will review on the plan page and approve
      // After approval, continueAfterApproval() will be called
      console.log('[BUILD-ORCHESTRATOR] Planning complete. Waiting for user approval.');
      
      // Check if plan is already approved (for resumed builds)
      const session = await BuildSessionModel.findById(this.session._id, this.session.userId);
      if (!session?.artifacts?.planApproved) {
        // Plan not approved yet, stop here
        return;
      }

      // Plan approved, continue with the rest
      await this.continueAfterApproval();
    } catch (error) {
      console.error('[BUILD-ORCHESTRATOR] Build phases failed:', error);
      await this.handleBuildError(error);
    }
  }

  /**
   * Continue build after plan approval
   */
  async continueAfterApproval(): Promise<void> {
    try {
      console.log('[BUILD-ORCHESTRATOR] Plan approved, continuing build...');

      // Phase 2: Requirements
      await this.executePhase('requirements', ['requirements']);

      // Phase 3: Architecture
      await this.executePhase('architecture', ['architecture']);

      // Phase 4: UI Design
      await this.executePhase('ui-design', ['ui-ux']);

      // Update status to building
      await BuildSessionModel.updateStatus(this.session._id, 'building');

      // Phase 5: Code Generation
      await this.executePhase('code-generation', ['code']);

      // Update status to reviewing
      await BuildSessionModel.updateStatus(this.session._id, 'reviewing');

      // Phase 6: Review
      await this.executePhase('review', ['review']);

      // Phase 7: Testing (optional)
      if (this.session.buildConfig.generateTests) {
        await BuildSessionModel.updateStatus(this.session._id, 'testing');
        await this.executePhase('testing', ['test']);
      }

      // Complete build
      await this.completeBuild();
    } catch (error) {
      console.error('[BUILD-ORCHESTRATOR] Build phases failed:', error);
      await this.handleBuildError(error);
    }
  }

  /**
   * Execute a single phase
   */
  private async executePhase(
    phaseName: string,
    agentTypes: AgentType[]
  ): Promise<void> {
    console.log(`[BUILD-ORCHESTRATOR] Executing phase: ${phaseName}`);

    // Update phase
    await BuildSessionModel.updatePhase(
      this.session._id,
      phaseName as any,
      this.calculateProgress()
    );

    // Log phase change
    await BuildActivityModel.logPhaseChanged(
      this.session._id,
      this.session.projectId,
      this.session.userId,
      phaseName
    );

    // Execute agents sequentially
    for (const agentType of agentTypes) {
      await this.executeAgent(agentType);
    }
  }

  /**
   * Execute a single agent
   */
  private async executeAgent(agentType: AgentType): Promise<void> {
    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent not found: ${agentType}`);
    }

    console.log(`[BUILD-ORCHESTRATOR] Executing ${agent.name}`);

    // Create task
    const taskId = `${agentType}-${Date.now()}`;
    const task = await BuildTaskModel.create({
      sessionId: this.session._id,
      projectId: this.session.projectId,
      userId: this.session.userId,
      taskId,
      agentType,
      taskType: 'primary',
      title: `Execute ${agent.name}`,
      description: agent.description,
      priority: 10,
      input: {
        context: {},
        parameters: {},
      },
    });

    try {
      // Update task status
      await BuildTaskModel.updateStatus(task._id, 'running');

      // Log agent started
      await BuildActivityModel.logAgentStarted(
        this.session._id,
        this.session.projectId,
        this.session.userId,
        agentType,
        task.title
      );

      // Execute agent
      const startTime = Date.now();
      const output = await agent.execute(this.context);
      const duration = Date.now() - startTime;

      // Validate output
      const validation = agent.validateOutput(output);
      if (!validation.valid) {
        throw new Error(`Invalid agent output: ${validation.errors?.join(', ')}`);
      }

      // Save output
      await BuildTaskModel.setOutput(task._id, {
        success: true,
        data: output.data,
        warnings: output.warnings,
      });

      // Track AI usage
      await BuildTaskModel.trackAIUsage(task._id, output.aiUsage);
      await BuildSessionModel.trackAIUsage(
        this.session._id,
        agentType,
        output.aiUsage
      );

      // Update context with agent output
      this.updateContextWithOutput(agentType, output);

      // Increment session results
      await BuildSessionModel.incrementResults(this.session._id, 'tasksCompleted');

      // Log agent completed
      await BuildActivityModel.logAgentCompleted(
        this.session._id,
        this.session.projectId,
        this.session.userId,
        agentType,
        task.title,
        duration
      );

      console.log(`[BUILD-ORCHESTRATOR] ${agent.name} completed successfully`);
    } catch (error) {
      console.error(`[BUILD-ORCHESTRATOR] ${agent.name} failed:`, error);

      // Save error
      await BuildTaskModel.setError(task._id, {
        message: error instanceof Error ? error.message : 'Unknown error',
        retryable: false,
      });

      // Increment failed tasks
      await BuildSessionModel.incrementResults(this.session._id, 'tasksFailed');

      // Log error
      await BuildActivityModel.logError(
        this.session._id,
        this.session.projectId,
        this.session.userId,
        error instanceof Error ? error.message : 'Unknown error',
        agentType
      );

      throw error;
    }
  }

  /**
   * Update context with agent output
   */
  private async updateContextWithOutput(agentType: AgentType, output: AgentOutput): Promise<void> {
    switch (agentType) {
      case 'planner':
        this.context.plan = output.data.plan;
        // Save plan to session artifacts for review
        await BuildSessionModel.update(this.session._id, this.session.userId, {
          'artifacts.plan': output.data.plan,
        });
        // Create plan.md file
        await this.createPlanFile(output.data.plan);
        break;
      case 'requirements':
        this.context.requirements = output.data.requirements;
        break;
      case 'architecture':
        this.context.architecture = output.data.architecture;
        break;
      case 'ui-ux':
        this.context.uiDesign = output.data.design;
        break;
      case 'code':
        // Load generated files into context
        await this.loadGeneratedFilesIntoContext();
        break;
      case 'review':
        // Review doesn't add to context
        break;
      case 'test':
        // Test doesn't add to context
        break;
    }
  }

  /**
   * Create plan.md file with formatted plan content
   */
  private async createPlanFile(plan: any): Promise<void> {
    try {
      const planContent = this.formatPlanAsMarkdown(plan);
      
      await createFile({
        projectId: this.project._id.toString(),
        userId: this.session.userId,
        path: 'plan.md',
        content: planContent,
        editedBy: 'ai',
      });

      // Log file created
      await BuildActivityModel.logFileCreated(
        this.session._id,
        this.session.projectId,
        this.session.userId,
        'plan.md'
      );

      // Increment files generated
      await BuildSessionModel.incrementResults(this.session._id, 'filesGenerated');

      console.log('[BUILD-ORCHESTRATOR] Created plan.md file');
    } catch (error) {
      console.error('[BUILD-ORCHESTRATOR] Failed to create plan.md:', error);
      // Don't fail the build if plan.md creation fails
    }
  }

  /**
   * Format plan as markdown
   */
  private formatPlanAsMarkdown(plan: any): string {
    let md = `# Project Plan\n\n`;
    md += `> Generated by VettCode AI Build Team\n\n`;
    
    // Overview
    md += `## Overview\n\n${plan.overview}\n\n`;
    
    // Features
    if (plan.features && plan.features.length > 0) {
      md += `## Features\n\n`;
      plan.features.forEach((feature: any, idx: number) => {
        md += `### ${idx + 1}. ${feature.name} (${feature.priority} priority)\n\n`;
        md += `${feature.description}\n\n`;
        md += `**Estimated Duration:** ${feature.estimatedDuration} hours\n\n`;
      });
    }
    
    // Pages
    if (plan.pages && plan.pages.length > 0) {
      md += `## Pages & Routes\n\n`;
      plan.pages.forEach((page: any) => {
        md += `### ${page.name}\n\n`;
        md += `- **Route:** \`${page.route}\`\n`;
        md += `- **Description:** ${page.description}\n`;
        if (page.components && page.components.length > 0) {
          md += `- **Components:** ${page.components.join(', ')}\n`;
        }
        md += `\n`;
      });
    }
    
    // Tech Stack
    if (plan.techStack) {
      md += `## Tech Stack\n\n`;
      if (plan.techStack.frontend) {
        md += `**Frontend:** ${plan.techStack.frontend.join(', ')}\n\n`;
      }
      if (plan.techStack.backend) {
        md += `**Backend:** ${plan.techStack.backend.join(', ')}\n\n`;
      }
      if (plan.techStack.database) {
        md += `**Database:** ${plan.techStack.database}\n\n`;
      }
      if (plan.techStack.styling) {
        md += `**Styling:** ${plan.techStack.styling}\n\n`;
      }
    }
    
    // Timeline
    if (plan.timeline) {
      md += `## Timeline\n\n`;
      md += `**Estimated Duration:** ${plan.timeline.estimatedDays} days\n\n`;
      if (plan.timeline.phases && plan.timeline.phases.length > 0) {
        md += `**Phases:**\n\n`;
        plan.timeline.phases.forEach((phase: string, idx: number) => {
          md += `${idx + 1}. ${phase}\n`;
        });
        md += `\n`;
      }
    }
    
    // Security Considerations
    if (plan.securityConsiderations && plan.securityConsiderations.length > 0) {
      md += `## Security Considerations\n\n`;
      plan.securityConsiderations.forEach((consideration: string) => {
        md += `- ${consideration}\n`;
      });
      md += `\n`;
    }
    
    md += `---\n\n`;
    md += `*Created with [VettCode](https://vettcode.dev) AI Build Team*\n`;
    
    return md;
  }

  /**
   * Load generated files into context
   */
  private async loadGeneratedFilesIntoContext(): Promise<void> {
    try {
      const files = await getProjectFiles(
        this.project._id.toString(),
        this.session.userId
      );

      this.context.generatedFiles.clear();
      files.forEach(file => {
        this.context.generatedFiles.set(file.path, {
          content: file.content,
          version: file.version,
        });
      });

      // Update session results
      await BuildSessionModel.incrementResults(
        this.session._id,
        'filesGenerated',
        files.length
      );

      // Calculate lines of code
      const totalLines = files.reduce(
        (sum, file) => sum + file.content.split('\n').length,
        0
      );
      await BuildSessionModel.update(this.session._id, this.session.userId, {
        'results.linesOfCode': totalLines,
      });
    } catch (error) {
      console.error('[BUILD-ORCHESTRATOR] Failed to load generated files:', error);
    }
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(): number {
    // Simple progress calculation based on phase
    const phases = ['planning', 'requirements', 'architecture', 'ui-design', 'code-generation', 'review', 'testing'];
    const currentIndex = phases.indexOf(this.context.currentPhase);
    return Math.round(((currentIndex + 1) / phases.length) * 100);
  }

  /**
   * Complete build
   */
  private async completeBuild(): Promise<void> {
    console.log('[BUILD-ORCHESTRATOR] Build completed successfully');

    // Update session
    await BuildSessionModel.updateStatus(this.session._id, 'ready');
    await BuildSessionModel.updatePhase(this.session._id, 'complete', 100);

    // Calculate duration
    const duration = Date.now() - this.session.startedAt.getTime();
    await BuildSessionModel.update(this.session._id, this.session.userId, {
      actualDuration: Math.round(duration / 1000),
    });

    // Update project
    await VibeProjectModel.update(this.project._id.toString(), this.session.userId, {
      status: 'ready',
      currentBuildSession: this.session._id,
      lastBuildSession: this.session._id,
    });

    // Log completion
    await BuildActivityModel.create({
      sessionId: this.session._id,
      projectId: this.session.projectId,
      userId: this.session.userId,
      type: 'info',
      severity: 'success',
      title: 'Build completed',
      message: `Successfully built ${this.project.name}`,
      icon: '✅',
      color: 'green',
    });
  }

  /**
   * Handle build error
   */
  private async handleBuildError(error: any): Promise<void> {
    console.error('[BUILD-ORCHESTRATOR] Handling build error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Save error to session
    await BuildSessionModel.setError(this.session._id, {
      message: errorMessage,
      phase: this.context.currentPhase,
      task: 'N/A',
      timestamp: new Date(),
      recoverable: false,
    });

    // Log error activity
    await BuildActivityModel.logError(
      this.session._id,
      this.session.projectId,
      this.session.userId,
      errorMessage
    );
  }

  /**
   * Get build status
   */
  async getStatus(sessionId: string, userId: string): Promise<BuildProgress> {
    const session = await BuildSessionModel.findById(new ObjectId(sessionId), userId);
    if (!session) {
      throw new Error('Build session not found');
    }

    const tasks = await BuildTaskModel.getBySession(new ObjectId(sessionId));
    const currentTask = tasks.find(t => t.status === 'running');

    return {
      session,
      currentTask,
      progress: {
        phase: session.phase,
        percentage: session.progress,
        tasksCompleted: session.results.tasksCompleted,
        tasksTotal: session.results.tasksCompleted + session.results.tasksFailed + tasks.filter(t => t.status === 'pending').length,
      },
    };
  }
}
