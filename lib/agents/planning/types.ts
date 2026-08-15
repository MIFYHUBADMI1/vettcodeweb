/**
 * Planning Section Types
 * Defines all section-specific interfaces for segmented planning
 */

import { PlanSection } from '../../models/BuildSession';

/**
 * Section IDs (in generation order)
 */
export type SectionId = 
  | 'projectUnderstanding'
  | 'projectGoals'
  | 'coreFeatures'
  | 'userExperience'
  | 'pages'
  | 'designDirection'
  | 'techStack'
  | 'dataStructure'
  | 'architecture'
  | 'security'
  | 'testing'
  | 'summary';

/**
 * Section Metadata
 */
export interface SectionMetadata {
  id: SectionId;
  name: string;
  order: number;
  description: string;
  dependencies: SectionId[];
  checkpoint?: number; // Which checkpoint this section belongs to
  requiredForProjectTypes?: string[]; // If specified, only for these project types
  modelTier: 1 | 2 | 3 | 4; // Recommended model tier
  estimatedTokens: number;
}

/**
 * All Section Metadata
 */
export const SECTION_METADATA: Record<SectionId, SectionMetadata> = {
  projectUnderstanding: {
    id: 'projectUnderstanding',
    name: 'Project Understanding',
    order: 1,
    description: 'Translate user idea into simple language',
    dependencies: [],
    checkpoint: 1,
    modelTier: 1,
    estimatedTokens: 1000,
  },
  projectGoals: {
    id: 'projectGoals',
    name: 'Project Goals',
    order: 2,
    description: 'Define what the application should accomplish',
    dependencies: ['projectUnderstanding'],
    checkpoint: 1,
    modelTier: 1,
    estimatedTokens: 1200,
  },
  coreFeatures: {
    id: 'coreFeatures',
    name: 'Core Features',
    order: 3,
    description: 'List main functionality in beginner-friendly terms',
    dependencies: ['projectGoals'],
    checkpoint: 1,
    modelTier: 1,
    estimatedTokens: 1500,
  },
  userExperience: {
    id: 'userExperience',
    name: 'User Experience',
    order: 4,
    description: 'Define how users will interact with the app',
    dependencies: ['coreFeatures'],
    checkpoint: 2,
    modelTier: 2,
    estimatedTokens: 1500,
  },
  pages: {
    id: 'pages',
    name: 'Pages / Screens',
    order: 5,
    description: 'Design page and screen structure',
    dependencies: ['coreFeatures', 'userExperience'],
    checkpoint: 2,
    modelTier: 2,
    estimatedTokens: 1800,
  },
  designDirection: {
    id: 'designDirection',
    name: 'Design Direction',
    order: 6,
    description: 'Define visual style and theme',
    dependencies: ['pages'],
    checkpoint: 2,
    modelTier: 2,
    estimatedTokens: 1500,
  },
  techStack: {
    id: 'techStack',
    name: 'Technology Stack',
    order: 7,
    description: 'Select technologies with beginner explanations',
    dependencies: ['coreFeatures', 'pages'],
    modelTier: 2,
    estimatedTokens: 1500,
  },
  dataStructure: {
    id: 'dataStructure',
    name: 'Data Structure',
    order: 8,
    description: 'Design what information needs to be stored',
    dependencies: ['coreFeatures', 'techStack'],
    modelTier: 2,
    estimatedTokens: 1800,
  },
  architecture: {
    id: 'architecture',
    name: 'Architecture Overview',
    order: 9,
    description: 'High-level system design',
    dependencies: ['techStack', 'dataStructure'],
    modelTier: 2,
    estimatedTokens: 2000,
  },
  security: {
    id: 'security',
    name: 'Security Considerations',
    order: 10,
    description: 'How to keep the application safe',
    dependencies: ['architecture', 'dataStructure'],
    checkpoint: 3,
    modelTier: 2,
    estimatedTokens: 1500,
  },
  testing: {
    id: 'testing',
    name: 'Build & Testing Strategy',
    order: 11,
    description: 'How to verify the application works',
    dependencies: ['architecture'],
    checkpoint: 3,
    modelTier: 2,
    estimatedTokens: 1500,
  },
  summary: {
    id: 'summary',
    name: 'Plan Summary',
    order: 12,
    description: 'Complete overview of the plan',
    dependencies: ['projectGoals', 'coreFeatures', 'pages', 'techStack', 'architecture'],
    checkpoint: 3,
    modelTier: 1,
    estimatedTokens: 2000,
  },
};

/**
 * Get sections in generation order
 */
export function getSectionsInOrder(): SectionMetadata[] {
  return Object.values(SECTION_METADATA).sort((a, b) => a.order - b.order);
}

/**
 * Get sections for a checkpoint
 */
export function getSectionsForCheckpoint(checkpoint: number): SectionMetadata[] {
  return Object.values(SECTION_METADATA).filter(s => s.checkpoint === checkpoint);
}

/**
 * Get sections that depend on a given section
 */
export function getDependentSections(sectionId: SectionId): SectionMetadata[] {
  return Object.values(SECTION_METADATA).filter(s => 
    s.dependencies.includes(sectionId)
  );
}

/**
 * Check if all dependencies are completed
 */
export function areDependenciesCompleted(
  sectionId: SectionId, 
  completedSections: string[]
): boolean {
  const metadata = SECTION_METADATA[sectionId];
  return metadata.dependencies.every(dep => completedSections.includes(dep));
}

/**
 * Get next section to generate
 */
export function getNextSection(completedSections: string[]): SectionMetadata | null {
  const sections = getSectionsInOrder();
  
  for (const section of sections) {
    // Skip if already completed
    if (completedSections.includes(section.id)) continue;
    
    // Check if dependencies are met
    if (areDependenciesCompleted(section.id, completedSections)) {
      return section;
    }
  }
  
  return null; // All sections completed or dependencies not met
}

/**
 * Calculate plan readiness percentage
 */
export function calculateReadiness(completedSections: string[]): number {
  const totalSections = Object.keys(SECTION_METADATA).length;
  return Math.round((completedSections.length / totalSections) * 100);
}
