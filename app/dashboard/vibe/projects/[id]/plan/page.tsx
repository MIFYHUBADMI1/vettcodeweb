/**
 * Segmented AI Build Plan Page
 * Real-time plan generation with section-by-section visibility
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVibeProject } from '@/lib/hooks/useVibeProjects';
import { 
  useSegmentedPlan, 
  useStartSegmentedPlan,
  usePausePlanning,
  useResumePlanning,
  useApprovePlan,
  useResetPlan,
  useRefreshPlan
} from '@/lib/hooks/useSegmentedPlan';
import { adaptSegmentedPlanToUI } from '@/lib/utils/plan-adapter';
import { Loader2, AlertCircle, ArrowLeft, Sparkles, Play, Pause, CheckCircle, RotateCcw, RefreshCw, Trash2, Layout, Users, Palette, Database, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  PlanProgressCircle,
  PlanReadinessSidebar,
  PlanOriginalIdeaCard,
  PlanGoalsSection,
  PlanFeaturesSection,
  PlanSectionCard,
  PlanPageItem,
  PlanTechStackCard,
  PlanArchitectureCard,
  PlanSecurityCard,
  PlanTestingCard,
  PlanSectionCardSkeleton,
} from '@/components/vibe/plan';


export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: projectData, isLoading: projectLoading } = useVibeProject(projectId);
  const { data: planData, isLoading: planLoading, refetch } = useSegmentedPlan(projectId);
  const startPlanMutation = useStartSegmentedPlan(projectId);
  const pauseMutation = usePausePlanning(projectId);
  const resumeMutation = useResumePlanning(projectId);
  const approveMutation = useApprovePlan(projectId);
  const resetMutation = useResetPlan(projectId);
  const refreshMutation = useRefreshPlan(projectId);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Close reset confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showResetConfirm && !(e.target as Element).closest('.reset-dropdown-container')) {
        setShowResetConfirm(false);
      }
    };

    if (showResetConfirm) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResetConfirm]);

  // Loading state
  if (projectLoading || planLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading plan...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (!projectData?.project) {
    return <ErrorState message="Project not found" />;
  }

  const project = projectData.project;
  const plan = planData?.plan;
  const progress = planData?.progress;

  // Check if plan hasn't started yet or was just reset
  if (!plan || plan.status === 'initializing' || plan.status === 'not_started') {
    return (
      <div className="min-h-screen bg-gray-950">
        <HeaderSection projectId={projectId} projectName={project.name} />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Generate Your Plan</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
           Vett AI will create a comprehensive deatiled plan section by section. You'll see real-time progress 
            as each section completes. The process takes about 5-10 seconds.
          </p>
          <button
            onClick={() => startPlanMutation.mutate()}
            disabled={startPlanMutation.isPending}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
          >
            {startPlanMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Start Generating Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Adapt plan data to UI format
  const adaptedPlan = adaptSegmentedPlanToUI(
    planData!,
    project.description,
    project.type,
    project.framework
  );

  const isGenerating = plan.status === 'generating';
  const isCompleted = plan.status === 'completed' || plan.status === 'approved';
  const isPaused = plan.status === 'paused';

  // Calculate completion percentage
  const totalSections = 12;
  const completedCount = plan.completedSections?.length || 0;
  const completionPercent = Math.round((completedCount / totalSections) * 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <HeaderSection projectId={projectId} projectName={project.name}>
        <div className="flex items-center gap-3">
          {/* Refresh Button - Always available */}
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2 group"
            title="Refresh plan"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 group-hover:text-white transition-colors ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-gray-400 group-hover:text-white transition-colors">
              {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>

          {/* Reset Button - Show dropdown on click */}
          {plan && (
            <div className="relative reset-dropdown-container">
              <button
                onClick={() => setShowResetConfirm(!showResetConfirm)}
                disabled={resetMutation.isPending || isGenerating}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2 group"
                title="Reset plan"
              >
                {resetMutation.isPending ? (
                  <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                )}
                <span className="hidden sm:inline text-gray-400 group-hover:text-red-400 transition-colors">
                  {resetMutation.isPending ? 'Resetting...' : 'Reset'}
                </span>
              </button>

              {/* Confirmation Dropdown */}
              {showResetConfirm && !resetMutation.isPending && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Reset Plan?</p>
                      <p className="text-xs text-gray-400">
                        This will delete all plan data and let you start fresh. This cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        resetMutation.mutate(undefined, {
                          onSuccess: () => {
                            setShowResetConfirm(false);
                          }
                        });
                      }}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {resetMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Reset Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <StatusBadge status={plan.status} />
          
          {isGenerating && (
            <button
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {pauseMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
              {pauseMutation.isPending ? 'Pausing...' : 'Pause'}
            </button>
          )}

          {isPaused && (
            <button
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {resumeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {resumeMutation.isPending ? 'Resuming...' : 'Resume'}
            </button>
          )}

          {isCompleted && (
            <button
              onClick={() => {
                approveMutation.mutate(undefined, {
                  onSuccess: () => {
                    setTimeout(() => router.push(`/dashboard/vibe/projects/${projectId}/overview`), 1500);
                  }
                });
              }}
              disabled={approveMutation.isPending}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve & Start Building
                </>
              )}
            </button>
          )}
        </div>
      </HeaderSection>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left: Main Content - 2 Column Grid */}
          <div className="flex-1">
            {isGenerating && (
              <div className="mb-8 p-6 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin flex-shrink-0" />
                  <div>
                    <p className="font-medium text-purple-300">
                      Generating plan... {completionPercent}% complete
                    </p>
                    <p className="text-sm text-purple-400 mt-1">
                      Current section: {plan.currentSection?.replace(/([A-Z])/g, ' $1').trim() || 'Starting...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Conflict Warnings */}
            {plan.conflictWarnings && plan.conflictWarnings.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-300 mb-2">Dependency Conflicts Detected</p>
                    {plan.conflictWarnings.map((warning, idx) => (
                      <p key={idx} className="text-sm text-yellow-400 mb-1">
                        • {warning.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Grid Layout - Desktop 2 columns, Mobile 1 column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Idea */}
              <div className="lg:col-span-2">
                <PlanOriginalIdeaCard idea={adaptedPlan.originalIdea} />
              </div>

              {/* Project Goals */}
              {renderSectionOrSkeleton(
                'projectGoals',
                plan,
                <PlanGoalsSection goals={adaptedPlan.goals} />
              )}

              {/* Core Features */}
              {renderSectionOrSkeleton(
                'coreFeatures',
                plan,
                <PlanFeaturesSection features={adaptedPlan.features} />
              )}

              {/* Pages & Screens */}
              {renderSectionOrSkeleton(
                'pages',
                plan,
                <PlanSectionCard
                  title="Pages & Screens"
                  icon={<Layout className="w-5 h-5" />}
                  onAddItem={() => {}}
                >
                  {adaptedPlan.pages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No pages defined yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {adaptedPlan.pages.map((page) => (
                        <PlanPageItem
                          key={page.id}
                          name={page.name}
                          route={page.route}
                          description={page.description}
                          requiresAuth={page.requiresAuth}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                      ))}
                    </div>
                  )}
                </PlanSectionCard>
              )}

              {/* User Experience */}
              {renderSectionOrSkeleton(
                'userExperience',
                plan,
                <PlanSectionCard
                  title="User Experience"
                  icon={<Users className="w-5 h-5" />}
                  onAddItem={() => {}}
                >
                  {!plan.sectionsData.userExperience?.simpleExplanation ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>UX flow not defined yet</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {plan.sectionsData.userExperience.simpleExplanation}
                    </div>
                  )}
                </PlanSectionCard>
              )}

              {/* Design Direction */}
              {renderSectionOrSkeleton(
                'designDirection',
                plan,
                <PlanSectionCard
                  title="Design Direction"
                  icon={<Palette className="w-5 h-5" />}
                  onAddItem={() => {}}
                >
                  {!plan.sectionsData.designDirection?.simpleExplanation ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Design not defined yet</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {plan.sectionsData.designDirection.simpleExplanation}
                    </div>
                  )}
                </PlanSectionCard>
              )}

              {/* Tech Stack */}
              {renderSectionOrSkeleton(
                'techStack',
                plan,
                <PlanTechStackCard techStack={adaptedPlan.techStack} />
              )}

              {/* Data Structure */}
              {renderSectionOrSkeleton(
                'dataStructure',
                plan,
                <PlanSectionCard
                  title="Data Structure"
                  icon={<Database className="w-5 h-5" />}
                  onAddItem={() => {}}
                >
                  {adaptedPlan.dataStructure.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Data models not defined yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {adaptedPlan.dataStructure.map((model, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                        >
                          <h4 className="font-medium text-white mb-1">{model.name}</h4>
                          <p className="text-xs text-gray-400">{model.fields}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </PlanSectionCard>
              )}

              {/* Architecture */}
              {renderSectionOrSkeleton(
                'architecture',
                plan,
                <PlanArchitectureCard
                  overview={adaptedPlan.architecture.overview}
                  pattern={adaptedPlan.architecture.pattern}
                  layers={adaptedPlan.architecture.layers}
                  keyDecisions={adaptedPlan.architecture.keyDecisions}
                />
              )}

              {/* Security */}
              {renderSectionOrSkeleton(
                'security',
                plan,
                <PlanSecurityCard considerations={adaptedPlan.security} />
              )}

              {/* Testing Strategy */}
              {renderSectionOrSkeleton(
                'testing',
                plan,
                <PlanTestingCard
                  strategies={adaptedPlan.testing}
                  coverageTarget={plan.sectionsData.testing?.data?.coverageTarget || 80}
                />
              )}

              {/* Summary */}
              {renderSectionOrSkeleton(
                'summary',
                plan,
                <PlanSectionCard
                  title="Plan Summary"
                  icon={<FileText className="w-5 h-5" />}
                  onAddItem={() => {}}
                >
                  {!plan.sectionsData.summary?.simpleExplanation ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Summary not generated yet</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {plan.sectionsData.summary.simpleExplanation}
                    </div>
                  )}
                </PlanSectionCard>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <PlanReadinessSidebar
                progress={completionPercent}
                checklist={adaptedPlan.readinessChecklist}
                dataStructure={adaptedPlan.dataStructure}
                status={plan.status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render section or skeleton
function renderSectionOrSkeleton(
  sectionKey: string,
  plan: any,
  content: React.ReactNode
) {
  if (!plan || !plan.completedSections) {
    return <PlanSectionCardSkeleton />;
  }

  const isCompleted = plan.completedSections.includes(sectionKey);
  const isGenerating = plan.status === 'generating' && !isCompleted;

  if (isGenerating) {
    return <PlanSectionCardSkeleton />;
  }

  if (!isCompleted) {
    return null; // Don't show incomplete sections in completed state
  }

  return content;
}

// Header Component
function HeaderSection({ 
  projectId, 
  projectName, 
  children 
}: { 
  projectId: string; 
  projectName: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/vibe/projects/${projectId}/overview`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                AI Build Plan
              </h1>
              <p className="text-sm text-gray-400 mt-1">{projectName}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    initializing: { label: 'Initializing', className: 'bg-gray-500/20 text-gray-300' },
    generating: { label: 'Generating', className: 'bg-blue-500/20 text-blue-300' },
    paused: { label: 'Paused', className: 'bg-yellow-500/20 text-yellow-300' },
    completed: { label: 'Ready', className: 'bg-green-500/20 text-green-300' },
    approved: { label: 'Approved', className: 'bg-purple-500/20 text-purple-300' },
    failed: { label: 'Failed', className: 'bg-red-500/20 text-red-300' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.initializing;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

// Error State Component
function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <Link
          href="/dashboard/vibe"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-white transition-colors"
        >
          Back to Projects
        </Link>
      </div>
    </div>
  );
}
