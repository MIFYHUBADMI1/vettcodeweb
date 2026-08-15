/**
 * Build Progress Panel Component
 * Shows AI Build Team progress with task list and overall progress
 */

'use client';

import { BuildSession } from '@/lib/models/BuildSession';
import { BuildTask } from '@/lib/models/BuildTask';
import BuildTaskList from './BuildTaskList';
import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface BuildProgressPanelProps {
  session: BuildSession | null;
  tasks: BuildTask[];
  projectId: string;
}

function getPhaseDisplay(phase: string): string {
  const phases: Record<string, string> = {
    requirements: 'Requirements Analysis',
    architecture: 'System Architecture',
    'ui-design': 'UI/UX Design',
    'code-generation': 'Code Generation',
    review: 'Code Review',
    testing: 'Testing & Validation',
    complete: 'Build Complete',
  };
  return phases[phase] || phase;
}

function formatEstimatedTime(seconds?: number): string {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export default function BuildProgressPanel({
  session,
  tasks,
  projectId,
}: BuildProgressPanelProps) {
  // No build session yet
  if (!session) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          AI Build Team Progress
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          The AI team will build your project step by step
        </p>
        
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Ready to Build?
          </h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Click "Build with AI Team" in the header to start building your project automatically.
          </p>
        </div>
      </div>
    );
  }

  const isActive = ['queued', 'planning', 'building', 'reviewing', 'testing'].includes(
    session.status
  );
  const isComplete = session.status === 'ready';
  const isFailed = session.status === 'failed';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          AI Build Team Progress
        </h2>
        <p className="text-sm text-gray-400">
          {isActive && 'The AI team is building your project step by step'}
          {isComplete && 'Your project has been built successfully'}
          {isFailed && 'Build encountered an error'}
        </p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto mb-6 -mx-2 px-2">
        <BuildTaskList tasks={tasks} />
      </div>

      {/* Overall Progress */}
      <div className="border-t border-gray-800 pt-6 space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-semibold text-white">
              {session.progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isFailed
                  ? 'bg-red-500'
                  : isComplete
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
              style={{ width: `${session.progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              {session.results.tasksCompleted} tasks completed
            </span>
            {session.results.filesGenerated > 0 && (
              <span>
                {session.results.filesGenerated} files generated
              </span>
            )}
          </div>
          {session.estimatedDuration && isActive && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatEstimatedTime(session.estimatedDuration)}</span>
            </div>
          )}
        </div>

        {/* Phase indicator */}
        {session.phase && (
          <div className="text-xs text-gray-400">
            <span className="text-gray-500">Current phase:</span>{' '}
            <span className="text-purple-400 font-medium">
              {getPhaseDisplay(session.phase)}
            </span>
          </div>
        )}

        {/* Error message if failed */}
        {isFailed && session.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400 font-medium mb-1">
              Build Failed
            </p>
            <p className="text-xs text-red-300/80">
              {session.error.message}
            </p>
          </div>
        )}

        {/* View Full Build button (if build history page exists) */}
        {/* For now, commenting out until we have a build history page
        <Link
          href={`/dashboard/vibe/projects/${projectId}/builds/${session._id}`}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-300 transition-colors"
        >
          View Full Build
          <ArrowRight className="w-4 h-4" />
        </Link>
        */}
      </div>
    </div>
  );
}
