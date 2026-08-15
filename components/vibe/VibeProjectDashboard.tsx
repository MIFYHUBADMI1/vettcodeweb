/**
 * Vibe Project Dashboard Component
 * Main project overview dashboard with build progress, preview, and activities
 */

'use client';

import { VibeProject } from '@/lib/models/VibeProject';
import { BuildSession } from '@/lib/models/BuildSession';
import { BuildTask } from '@/lib/models/BuildTask';
import { BuildActivity } from '@/lib/models/BuildActivity';
import { VibeProjectFile } from '@/lib/models/VibeProjectFile';
import ProjectHeader from './ProjectHeader';
import BuildProgressPanel from './BuildProgressPanel';
import LivePreviewPanel from './LivePreviewPanel';
import BuildActivityPanel from './BuildActivityPanel';
import FilesChangedPanel from './FilesChangedPanel';
import QuickActionsPanel from './QuickActionsPanel';
import ProjectRequirementsPanel from './ProjectRequirementsPanel';
import { toast } from 'react-toastify';
import { useState } from 'react';

interface VibeProjectDashboardProps {
  project: VibeProject;
  buildSession: BuildSession | null;
  tasks: BuildTask[];
  activities: BuildActivity[];
  files: VibeProjectFile[];
  onStartBuild: () => void;
  onResumeBuild?: () => void;
}

export default function VibeProjectDashboard({
  project,
  buildSession,
  tasks,
  activities,
  files,
  onStartBuild,
  onResumeBuild,
}: VibeProjectDashboardProps) {
  const [isStartingBuild, setIsStartingBuild] = useState(false);

  const handleStartBuild = async () => {
    try {
      setIsStartingBuild(true);
      await onStartBuild();
      toast.success('🤖 AI Build Team started!');
    } catch (error) {
      console.error('Failed to start build:', error);
      toast.error('Failed to start build. Please try again.');
    } finally {
      setIsStartingBuild(false);
    }
  };

  const handleResumeBuild = async () => {
    if (onResumeBuild) {
      try {
        await onResumeBuild();
        toast.success('Build resumed');
      } catch (error) {
        console.error('Failed to resume build:', error);
        toast.error('Failed to resume build');
      }
    }
  };

  const handleRunScan = () => {
    // Navigate to security panel or trigger scan
    toast.info('Security scan starting...');
    // In a real implementation, this would trigger the scan
  };

  const isBuildActive = buildSession && [
    'queued',
    'planning',
    'building',
    'reviewing',
    'testing',
  ].includes(buildSession.status);

  const canResumeBuild = buildSession?.status === 'failed' || buildSession?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-[1920px] mx-auto p-6 space-y-6">
        {/* Project Header */}
        <ProjectHeader
          project={project}
          onStartBuild={!buildSession && !isStartingBuild ? handleStartBuild : undefined}
          buildInProgress={!!isBuildActive || isStartingBuild}
        />

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: AI Build Team Progress */}
          <div className="flex flex-col">
            <BuildProgressPanel
              session={buildSession}
              tasks={tasks}
              projectId={project._id.toString()}
            />
          </div>

          {/* Right: Live Preview */}
          <div className="flex flex-col">
            <LivePreviewPanel project={project} files={files} />
          </div>
        </div>

        {/* Secondary Content - 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Build Activity */}
          <div className="flex flex-col">
            <BuildActivityPanel
              activities={activities}
              sessionId={buildSession?._id.toString()}
            />
          </div>

          {/* Files Changed */}
          <div className="flex flex-col">
            <FilesChangedPanel
              files={files}
              projectId={project._id.toString()}
              limit={10}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col">
            <QuickActionsPanel
              projectId={project._id.toString()}
              canResumeBuild={!!canResumeBuild}
              onResumeBuild={canResumeBuild ? handleResumeBuild : undefined}
              onRunScan={handleRunScan}
            />
          </div>
        </div>

        {/* Project Requirements - Full Width */}
        <ProjectRequirementsPanel
          project={project}
          session={buildSession}
        />
      </div>
    </div>
  );
}
