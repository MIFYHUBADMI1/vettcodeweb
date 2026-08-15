/**
 * Plan Adapter Utility
 * Transforms segmented plan data to UI-friendly format
 */

import { SegmentedPlanResponse } from '../hooks/useSegmentedPlan';

export interface AdaptedPlanData {
  originalIdea: {
    description: string;
    simpleExplanation?: string;
    projectType?: string;
    framework?: string;
  };
  goals: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    userBenefit?: string;
  }>;
  features: Array<{
    id: string;
    name: string;
    description: string;
    userStory?: string;
    priority: 'must-have' | 'nice-to-have' | 'future';
    estimatedComplexity?: 'simple' | 'moderate' | 'complex';
  }>;
  pages: Array<{
    id: string;
    name: string;
    route: string;
    description?: string;
    requiresAuth?: boolean;
  }>;
  techStack: {
    framework?: { name: string; why?: string };
    language?: { name: string; why?: string };
    styling?: { name: string; why?: string };
    uiComponents?: { name: string; why?: string };
    database?: { name: string; why?: string };
    orm?: { name: string; why?: string };
    authentication?: { name: string; why?: string };
    hosting?: { name: string; why?: string };
  };
  architecture: {
    overview: string;
    pattern?: { name: string; reason: string };
    layers?: string[];
    keyDecisions?: string[];
  };
  security: Array<{
    id: string;
    title: string;
    description?: string;
    category?: 'authentication' | 'authorization' | 'data-protection' | 'api-security' | 'general';
    implemented?: boolean;
  }>;
  testing: Array<{
    id: string;
    title: string;
    description?: string;
    type?: 'unit' | 'integration' | 'e2e' | 'performance' | 'accessibility' | 'general';
    implemented?: boolean;
  }>;
  dataStructure: Array<{
    name: string;
    fields: string;
  }>;
  readinessChecklist: Array<{
    label: string;
    completed: boolean;
    warning?: boolean;
  }>;
}

export function adaptSegmentedPlanToUI(
  planResponse: SegmentedPlanResponse,
  projectDescription?: string,
  projectType?: string,
  framework?: string
): AdaptedPlanData {
  const { plan } = planResponse;
  const sections = plan?.sectionsData || {};

  return {
    // Original Idea
    originalIdea: {
      description: projectDescription || '',
      simpleExplanation: sections.projectUnderstanding?.simpleExplanation,
      projectType,
      framework,
    },

    // Goals
    goals: sections.projectGoals?.data?.goals?.map((goal: any, index: number) => ({
      id: goal.id || `goal-${index}`,
      title: goal.title,
      description: goal.description,
      priority: mapPriority(goal.priority),
      userBenefit: goal.userBenefit,
    })) || [],

    // Features
    features: sections.coreFeatures?.data?.features?.map((feature: any, index: number) => ({
      id: feature.id || `feature-${index}`,
      name: feature.name,
      description: feature.description,
      userStory: feature.userStory,
      priority: feature.priority || 'nice-to-have',
      estimatedComplexity: feature.estimatedComplexity || 'moderate',
    })) || [],

    // Pages
    pages: sections.pages?.data?.pages?.map((page: any, index: number) => ({
      id: page.id || `page-${index}`,
      name: page.name,
      route: page.route,
      description: page.description,
      requiresAuth: page.requiresAuth || false,
    })) || [],

    // Tech Stack
    techStack: sections.techStack?.data?.technologies || {},

    // Architecture
    architecture: {
      overview: sections.architecture?.simpleExplanation || sections.architecture?.data?.overview || '',
      pattern: sections.architecture?.data?.pattern,
      layers: sections.architecture?.data?.layers,
      keyDecisions: sections.architecture?.data?.keyDecisions,
    },

    // Security
    security: sections.security?.data?.considerations?.map((item: any, index: number) => ({
      id: item.id || `security-${index}`,
      title: item.title || item.name,
      description: item.description,
      category: item.category || 'general',
      implemented: item.implemented || false,
    })) || [],

    // Testing
    testing: sections.testing?.data?.strategies?.map((item: any, index: number) => ({
      id: item.id || `testing-${index}`,
      title: item.title || item.name,
      description: item.description,
      type: item.type || 'general',
      implemented: item.implemented || false,
    })) || [],

    // Data Structure
    dataStructure: sections.dataStructure?.data?.dataModels?.map((model: any) => ({
      name: model.name,
      fields: model.fields?.map((f: any) => f.name).join(', ') || 'N/A',
    })) || [],

    // Readiness Checklist
    readinessChecklist: [
      {
        label: 'Project goals defined',
        completed: !!sections.projectGoals && sections.projectGoals.status === 'completed',
      },
      {
        label: 'Core features listed',
        completed: !!sections.coreFeatures && sections.coreFeatures.status === 'completed',
      },
      {
        label: 'Pages & screens defined',
        completed: !!sections.pages && sections.pages.status === 'completed',
      },
      {
        label: 'Technical stack selected',
        completed: !!sections.techStack && sections.techStack.status === 'completed',
      },
      {
        label: 'Data structure defined',
        completed: !!sections.dataStructure && sections.dataStructure.status === 'completed',
      },
      {
        label: 'Security considered',
        completed: !!sections.security && sections.security.status === 'completed',
      },
      {
        label: 'Testing strategy ready',
        completed: !!sections.testing && sections.testing.status === 'completed',
      },
      {
        label: 'Dependencies reviewed',
        completed: !plan?.conflictWarnings || plan.conflictWarnings.length === 0,
        warning: plan?.conflictWarnings && plan.conflictWarnings.length > 0,
      },
    ],
  };
}

function mapPriority(priority: string): 'high' | 'medium' | 'low' {
  const lowerPriority = priority?.toLowerCase() || '';
  if (lowerPriority.includes('high') || lowerPriority.includes('critical')) return 'high';
  if (lowerPriority.includes('medium') || lowerPriority.includes('normal')) return 'medium';
  return 'low';
}
