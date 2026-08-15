/**
 * Vibe Project Overview/Dashboard Page
 * Shows project status, build progress, preview, and activities
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVibeProject, useVibeProjectFiles } from '@/lib/hooks/useVibeProjects';
import {
  useActiveBuildSession,
  useBuildTasks,
  useBuildActivities,
  useStartBuild,
} from '@/lib/hooks/useVibeBuilds';
import VibeProjectDashboard from '@/components/vibe/VibeProjectDashboard';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // Fetch project data
  const { data: projectData, isLoading: projectLoading, error: projectError } = useVibeProject(projectId);
  
  // Fetch active build session
  const { data: sessionData, isLoading: sessionLoading } = useActiveBuildSession(projectId);
  
  // Fetch files
  const { data: filesData, isLoading: filesLoading } = useVibeProjectFiles(projectId);
  
  // Fetch build tasks (if session exists)
  const sessionId = sessionData?.session?._id.toString();
  const { data: tasksData } = useBuildTasks(sessionId || null);
  
  // Fetch build activities (if session exists)
  const { data: activitiesData } = useBuildActivities(sessionId || null, 20);
  
  // Start build mutation
  const startBuild = useStartBuild(projectId);

  // Loading state
  if (projectLoading || sessionLoading || filesLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading project dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (projectError || !projectData?.project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-gray-400 mb-6">
            {projectError?.message || 'This project does not exist or you do not have access to it.'}
          </p>
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

  const project = projectData.project;
  const buildSession = sessionData?.session || null;
  const tasks = tasksData?.tasks || [];
  const activities = activitiesData?.activities || [];
  const files = filesData?.files || [];

  const handleStartBuild = async () => {
    try {
      await startBuild.mutateAsync();
      // Redirect to plan page after build starts
      router.push(`/dashboard/vibe/projects/${projectId}/plan`);
    } catch (error) {
      // Error already handled by the mutation
      console.error('Failed to start build:', error);
    }
  };

  const handleResumeBuild = async () => {
    // Resume is same as redirecting to plan page if plan exists
    // Otherwise start new build
    if (buildSession?.artifacts?.plan) {
      router.push(`/dashboard/vibe/projects/${projectId}/plan`);
    } else {
      await handleStartBuild();
    }
  };

  return (
    <VibeProjectDashboard
      project={project}
      buildSession={buildSession}
      tasks={tasks}
      activities={activities}
      files={files}
      onStartBuild={handleStartBuild}
      onResumeBuild={handleResumeBuild}
    />
  );
}
