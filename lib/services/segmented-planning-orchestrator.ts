/**
 * Segmented Planning Orchestrator
 * Manages section-by-section plan generation
 */

import { ObjectId } from 'mongodb';
import { BuildSessionModel, BuildSession, PlanSection, SegmentedPlan, ConflictWarning } from '../models/BuildSession';
import { BuildActivityModel } from '../models/BuildActivity';
import { VibeProjectModel } from '../models/VibeProject';
import { AIRouter } from '../ai-router';
import { BuildContext } from '../agents/types';
import { getUserPlan } from '../subscription';
import { 
  SectionId, 
  SECTION_METADATA,
  getSectionsInOrder,
  getNextSection,
  getDependentSections,
  calculateReadiness 
} from '../agents/planning/types';
import { ProjectUnderstandingAgent } from '../agents/planning/project-understanding-agent';
import { ProjectGoalsAgent } from '../agents/planning/project-goals-agent';
import { CoreFeaturesAgent } from '../agents/planning/core-features-agent';
import { UserExperienceAgent } from '../agents/planning/user-experience-agent';
import { PagesAgent } from '../agents/planning/pages-agent';
import { DesignDirectionAgent } from '../agents/planning/design-direction-agent';
import { TechStackAgent } from '../agents/planning/tech-stack-agent';
import { DataStructureAgent } from '../agents/planning/data-structure-agent';
import { ArchitecturePlanningAgent } from '../agents/planning/architecture-planning-agent';
import { SecurityPlanningAgent } from '../agents/planning/security-planning-agent';
import { TestingStrategyAgent } from '../agents/planning/testing-strategy-agent';
import { SummaryAgent } from '../agents/planning/summary-agent';

export interface StartSegmentedPlanningRequest {
  projectId: string;
  userId: string;
}

export interface SegmentedPlanningProgress {
  session: BuildSession;
  currentSection?: SectionId;
  completedSections: string[];
  progress: number;
  status: SegmentedPlan['status'];
}

/**
 * Segmented Planning Orchestrator
 * Generates plan one section at a time
 */
export class SegmentedPlanningOrchestrator {
  private aiRouter: AIRouter;
  private sectionAgents: Map<SectionId, any>; // Will hold all section agents

  constructor() {
    this.aiRouter = new AIRouter();
    this.sectionAgents = new Map();
    
    // Register all 12 section agents
    this.sectionAgents.set('projectUnderstanding', new ProjectUnderstandingAgent(this.aiRouter));
    this.sectionAgents.set('projectGoals', new ProjectGoalsAgent(this.aiRouter));
    this.sectionAgents.set('coreFeatures', new CoreFeaturesAgent(this.aiRouter));
    this.sectionAgents.set('userExperience', new UserExperienceAgent(this.aiRouter));
    this.sectionAgents.set('pages', new PagesAgent(this.aiRouter));
    this.sectionAgents.set('designDirection', new DesignDirectionAgent(this.aiRouter));
    this.sectionAgents.set('techStack', new TechStackAgent(this.aiRouter));
    this.sectionAgents.set('dataStructure', new DataStructureAgent(this.aiRouter));
    this.sectionAgents.set('architecture', new ArchitecturePlanningAgent(this.aiRouter));
    this.sectionAgents.set('security', new SecurityPlanningAgent(this.aiRouter));
    this.sectionAgents.set('testing', new TestingStrategyAgent(this.aiRouter));
    this.sectionAgents.set('summary', new SummaryAgent(this.aiRouter));
    
    console.log('[SEGMENTED-PLANNING] Registered 12 section agents');
  }

  /**
   * Start segmented planning for a project
   */
  async startPlanGeneration(request: StartSegmentedPlanningRequest): Promise<BuildSession> {
    console.log(`[SEGMENTED-PLANNING] Starting for project ${request.projectId}`);

    try {
      // Load project
      const project = await VibeProjectModel.findById(request.projectId, request.userId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Check for existing active session
      const existingSession = await BuildSessionModel.getActiveSession(
        new ObjectId(request.projectId),
        request.userId
      );

      if (existingSession) {
        // If segmented plan already exists and is in progress, return it
        if (existingSession.artifacts?.segmentedPlan) {
          const status = existingSession.artifacts.segmentedPlan.status;
          if (status === 'generating' || status === 'paused') {
            console.log(`[SEGMENTED-PLANNING] Resuming existing session`);
            return existingSession;
          }
          if (status === 'completed' || status === 'approved') {
            console.log(`[SEGMENTED-PLANNING] Segmented plan already completed`);
            return existingSession;
          }
        }
        
        // If there's an active session without segmented plan, initialize it
        console.log(`[SEGMENTED-PLANNING] Existing session found, initializing segmented plan`);
        const segmentedPlan: SegmentedPlan = {
          status: 'initializing',
          completedSections: [],
          sectionsData: {},
          checkpoints: {},
          conflictWarnings: [],
        };

        await BuildSessionModel.update(existingSession._id, request.userId, {
          'artifacts.segmentedPlan': segmentedPlan,
          status: 'planning',
        } as any);

        // Get updated session
        const updatedSession = await BuildSessionModel.findById(existingSession._id, request.userId);
        if (!updatedSession) {
          throw new Error('Failed to initialize segmented plan');
        }

        // Log activity
        await BuildActivityModel.create({
          sessionId: updatedSession._id,
          projectId: updatedSession.projectId,
          userId: request.userId,
          type: 'info',
          severity: 'info',
          title: 'Segmented planning started',
          message: `Building plan for ${project.name} section by section`,
          icon: '🎯',
          color: 'blue',
        });

        // Start generation in background
        this.generateAllSections(updatedSession._id.toString(), request.userId).catch(error => {
          console.error('[SEGMENTED-PLANNING] Generation failed:', error);
          this.handlePlanningError(updatedSession._id.toString(), request.userId, error);
        });

        return updatedSession;
      }

      // Create new build session
      const session = await BuildSessionModel.create({
        projectId: new ObjectId(request.projectId),
        userId: request.userId,
        buildConfig: {
          autoApprove: false, // Segmented planning always requires approval
          generateTests: false,
          runSecurityScan: true,
          buildMode: 'standard',
        },
      });

      // Initialize segmented plan
      const segmentedPlan: SegmentedPlan = {
        status: 'initializing',
        completedSections: [],
        sectionsData: {},
        checkpoints: {},
        conflictWarnings: [],
      };

      await BuildSessionModel.update(session._id, request.userId, {
        'artifacts.segmentedPlan': segmentedPlan,
        status: 'planning',
      } as any);

      // Log activity
      await BuildActivityModel.create({
        sessionId: session._id,
        projectId: session.projectId,
        userId: request.userId,
        type: 'info',
        severity: 'info',
        title: 'Segmented planning started',
        message: `Building plan for ${project.name} section by section`,
        icon: '🎯',
        color: 'blue',
      });

      // Start generation in background
      this.generateAllSections(session._id.toString(), request.userId).catch(error => {
        console.error('[SEGMENTED-PLANNING] Generation failed:', error);
        this.handlePlanningError(session._id.toString(), request.userId, error);
      });

      return session;
    } catch (error) {
      console.error('[SEGMENTED-PLANNING] Failed to start:', error);
      throw error;
    }
  }

  /**
   * Generate all sections sequentially
   */
  private async generateAllSections(sessionId: string, userId: string): Promise<void> {
    console.log(`[SEGMENTED-PLANNING] Generating all sections for session ${sessionId}`);

    try {
      // Update status
      await BuildSessionModel.update(new ObjectId(sessionId), userId, {
        'artifacts.segmentedPlan.status': 'generating',
      } as any);

      // Get sections in order
      const sections = getSectionsInOrder();

      for (const sectionMetadata of sections) {
        // Check if paused
        const session = await BuildSessionModel.findById(new ObjectId(sessionId), userId);
        if (!session) throw new Error('Session not found');
        
        const planStatus = session.artifacts?.segmentedPlan?.status;
        if (planStatus === 'paused') {
          console.log(`[SEGMENTED-PLANNING] Planning paused at section ${sectionMetadata.id}`);
          return;
        }

        // Generate section
        console.log(`[SEGMENTED-PLANNING] Generating section: ${sectionMetadata.name}`);
        await this.generateSection(sessionId, userId, sectionMetadata.id);

        // Check if we hit a checkpoint
        if (sectionMetadata.checkpoint) {
          const checkpointSections = sections.filter(s => s.checkpoint === sectionMetadata.checkpoint);
          const lastInCheckpoint = checkpointSections[checkpointSections.length - 1];
          
          if (sectionMetadata.id === lastInCheckpoint.id) {
            console.log(`[SEGMENTED-PLANNING] Reached checkpoint ${sectionMetadata.checkpoint}`);
            // For now, continue automatically (user can pause manually)
            // In production, might pause here and wait for approval
          }
        }
      }

      // All sections completed
      await BuildSessionModel.update(new ObjectId(sessionId), userId, {
        'artifacts.segmentedPlan.status': 'completed',
      } as any);

      await BuildActivityModel.create({
        sessionId: new ObjectId(sessionId),
        projectId: (await BuildSessionModel.findById(new ObjectId(sessionId), userId))!.projectId,
        userId,
        type: 'info',
        severity: 'success',
        title: 'Plan ready for review',
        message: 'All sections completed. Review and approve to start building.',
        icon: '✅',
        color: 'green',
      });

      console.log(`[SEGMENTED-PLANNING] All sections completed for session ${sessionId}`);
    } catch (error) {
      console.error('[SEGMENTED-PLANNING] Section generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a single section
   */
  async generateSection(sessionId: string, userId: string, sectionId: SectionId): Promise<PlanSection> {
    console.log(`[SEGMENTED-PLANNING] Generating section: ${sectionId}`);

    try {
      const session = await BuildSessionModel.findById(new ObjectId(sessionId), userId);
      if (!session) throw new Error('Session not found');

      const project = await VibeProjectModel.findById(session.projectId.toString(), userId);
      if (!project) throw new Error('Project not found');

      // Update section status to generating
      await BuildSessionModel.update(new ObjectId(sessionId), userId, {
        [`artifacts.segmentedPlan.currentSection`]: sectionId,
        [`artifacts.segmentedPlan.sectionsData.${sectionId}.status`]: 'generating',
      } as any);

      // Get section agent
      const agent = this.sectionAgents.get(sectionId);
      if (!agent) {
        throw new Error(`No agent registered for section: ${sectionId}`);
      }

      // Build context
      const userPlan = await getUserPlan(userId);
      const context: BuildContext = {
        session,
        project,
        user: {
          email: userId,
          plan: userPlan,
        },
        generatedFiles: new Map(),
        currentPhase: 'planning',
        budget: {
          maxTokens: 50000,
          usedTokens: 0,
          maxCost: userPlan.monthlyAISpendLimit * 0.1,
          usedCost: 0,
        },
        // Add completed sections to context
        ...this.buildContextFromCompletedSections(session),
      };

      // Execute agent
      const output = await agent.execute(context);
      const section: PlanSection = output.data.section;

      // Save section using updateWithOperators to handle $addToSet
      await BuildSessionModel.updateWithOperators(new ObjectId(sessionId), userId, {
        $set: {
          [`artifacts.segmentedPlan.sectionsData.${sectionId}`]: section,
        },
        $addToSet: {
          'artifacts.segmentedPlan.completedSections': sectionId,
        },
      });

      // Log activity
      await BuildActivityModel.create({
        sessionId: new ObjectId(sessionId),
        projectId: session.projectId,
        userId,
        type: 'info',
        severity: 'info',
        title: `${SECTION_METADATA[sectionId].name} completed`,
        message: section.simpleExplanation.substring(0, 100),
        icon: '✅',
        color: 'green',
      });

      console.log(`[SEGMENTED-PLANNING] Section ${sectionId} completed successfully`);
      return section;
    } catch (error) {
      console.error(`[SEGMENTED-PLANNING] Section ${sectionId} failed:`, error);
      
      // Mark section as failed
      await BuildSessionModel.update(new ObjectId(sessionId), userId, {
        [`artifacts.segmentedPlan.sectionsData.${sectionId}.status`]: 'failed',
        [`artifacts.segmentedPlan.sectionsData.${sectionId}.error`]: 
          error instanceof Error ? error.message : 'Unknown error',
      } as any);

      throw error;
    }
  }

  /**
   * Build context from completed sections
   */
  private buildContextFromCompletedSections(session: BuildSession): Partial<BuildContext> {
    const segmentedPlan = session.artifacts?.segmentedPlan;
    if (!segmentedPlan) return {};

    const context: Partial<BuildContext> = {};

    // Add relevant completed sections to context
    if (segmentedPlan.sectionsData.projectUnderstanding) {
      context.plan = { understanding: segmentedPlan.sectionsData.projectUnderstanding.data };
    }
    if (segmentedPlan.sectionsData.projectGoals) {
      context.plan = {
        ...context.plan,
        goals: segmentedPlan.sectionsData.projectGoals.data,
      };
    }
    if (segmentedPlan.sectionsData.coreFeatures) {
      context.plan = {
        ...context.plan,
        features: segmentedPlan.sectionsData.coreFeatures.data,
      };
    }

    return context;
  }

  /**
   * Pause planning
   */
  async pausePlanning(sessionId: string, userId: string): Promise<void> {
    await BuildSessionModel.update(new ObjectId(sessionId), userId, {
      'artifacts.segmentedPlan.status': 'paused',
    } as any);
  }

  /**
   * Resume planning
   */
  async resumePlanning(sessionId: string, userId: string): Promise<void> {
    const session = await BuildSessionModel.findById(new ObjectId(sessionId), userId);
    if (!session) throw new Error('Session not found');

    await BuildSessionModel.update(new ObjectId(sessionId), userId, {
      'artifacts.segmentedPlan.status': 'generating',
    } as any);

    // Continue generation
    this.generateAllSections(sessionId, userId).catch(error => {
      console.error('[SEGMENTED-PLANNING] Resume failed:', error);
      this.handlePlanningError(sessionId, userId, error);
    });
  }

  /**
   * Regenerate a single section
   */
  async regenerateSection(sessionId: string, userId: string, sectionId: SectionId): Promise<PlanSection> {
    console.log(`[SEGMENTED-PLANNING] Regenerating section: ${sectionId}`);
    
    // Mark dependent sections as needs_review
    const dependents = getDependentSections(sectionId);
    for (const dependent of dependents) {
      await BuildSessionModel.update(new ObjectId(sessionId), userId, {
        [`artifacts.segmentedPlan.sectionsData.${dependent.id}.status`]: 'needs_review',
      } as any);
    }

    // Regenerate the section
    return await this.generateSection(sessionId, userId, sectionId);
  }

  /**
   * Approve plan and transition to full build
   */
  async approvePlan(sessionId: string, userId: string): Promise<void> {
    console.log(`[SEGMENTED-PLANNING] Approving plan for session ${sessionId}`);

    const session = await BuildSessionModel.findById(new ObjectId(sessionId), userId);
    if (!session) throw new Error('Session not found');

    // Validate all required sections are completed
    const segmentedPlan = session.artifacts?.segmentedPlan;
    if (!segmentedPlan) throw new Error('No segmented plan found');

    const requiredSections = getSectionsInOrder();
    const completedSections = segmentedPlan.completedSections;
    
    const missingSections = requiredSections.filter(s => !completedSections.includes(s.id));
    if (missingSections.length > 0) {
      throw new Error(`Plan incomplete. Missing sections: ${missingSections.map(s => s.name).join(', ')}`);
    }

    // Assemble complete plan from sections (for backward compatibility with existing BuildOrchestrator)
    const completePlan = this.assembleCompletePlan(segmentedPlan);

    // Mark as approved
    await BuildSessionModel.update(new ObjectId(sessionId), userId, {
      'artifacts.segmentedPlan.status': 'approved',
      'artifacts.plan': completePlan, // Legacy format for BuildOrchestrator
      'artifacts.planApproved': true,
      'artifacts.planApprovedAt': new Date(),
    } as any);

    await BuildActivityModel.create({
      sessionId: new ObjectId(sessionId),
      projectId: session.projectId,
      userId,
      type: 'info',
      severity: 'success',
      title: 'Plan approved',
      message: 'Starting AI Build Team...',
      icon: '🚀',
      color: 'green',
    });

    console.log(`[SEGMENTED-PLANNING] Plan approved, ready for build`);
  }

  /**
   * Assemble complete plan from sections (for BuildOrchestrator)
   */
  private assembleCompletePlan(segmentedPlan: SegmentedPlan): any {
    const sections = segmentedPlan.sectionsData;

    return {
      overview: sections.projectUnderstanding?.simpleExplanation || '',
      goals: sections.projectGoals?.data || [],
      features: sections.coreFeatures?.data || [],
      pages: sections.pages?.data || [],
      techStack: sections.techStack?.data || {},
      dataStructure: sections.dataStructure?.data || {},
      architecture: sections.architecture?.data || {},
      securityConsiderations: sections.security?.data || [],
      testingStrategy: sections.testing?.data || {},
      summary: sections.summary?.data || {},
    };
  }

  /**
   * Detect conflicts after editing
   */
  async detectConflicts(sessionId: string, userId: string, editedSection: SectionId): Promise<ConflictWarning[]> {
    const dependents = getDependentSections(editedSection);
    
    if (dependents.length === 0) return [];

    const warnings: ConflictWarning[] = [{
      section: editedSection,
      message: `You edited ${SECTION_METADATA[editedSection].name}. Dependent sections may need review.`,
      affectedSections: dependents.map(d => d.id),
    }];

    // Save warnings
    await BuildSessionModel.update(new ObjectId(sessionId), userId, {
      'artifacts.segmentedPlan.conflictWarnings': warnings,
    } as any);

    return warnings;
  }

  /**
   * Get planning progress
   */
  async getProgress(sessionId: string, userId: string): Promise<SegmentedPlanningProgress> {
    const session = await BuildSessionModel.findById(new ObjectId(sessionId), userId);
    if (!session) throw new Error('Session not found');

    const segmentedPlan = session.artifacts?.segmentedPlan;
    if (!segmentedPlan) throw new Error('No segmented plan found');

    return {
      session,
      currentSection: segmentedPlan.currentSection as SectionId,
      completedSections: segmentedPlan.completedSections,
      progress: calculateReadiness(segmentedPlan.completedSections),
      status: segmentedPlan.status,
    };
  }

  /**
   * Handle planning error
   */
  private async handlePlanningError(sessionId: string, userId: string, error: any): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await BuildSessionModel.update(new ObjectId(sessionId), userId, {
      'artifacts.segmentedPlan.status': 'failed',
    } as any);

    await BuildActivityModel.create({
      sessionId: new ObjectId(sessionId),
      projectId: (await BuildSessionModel.findById(new ObjectId(sessionId), userId))!.projectId,
      userId,
      type: 'error',
      severity: 'error',
      title: 'Planning failed',
      message: errorMessage,
        icon: '❌',
      color: 'red',
    });
  }
}
