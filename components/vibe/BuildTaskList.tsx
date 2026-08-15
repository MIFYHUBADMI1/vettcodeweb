/**
 * Build Task List Component
 * Displays agent tasks with visual status indicators
 */

'use client';

import { BuildTask, AgentType, TaskStatus } from '@/lib/models/BuildTask';
import { CheckCircle, Circle, Loader2, XCircle, Clock } from 'lucide-react';

interface BuildTaskListProps {
  tasks: BuildTask[];
}

const AGENT_NAMES: Record<AgentType, string> = {
  planner: 'Planner Agent',
  requirements: 'Requirements Agent',
  architecture: 'Architecture Agent',
  'ui-ux': 'UI/UX Agent',
  code: 'Code Agent',
  review: 'Review Agent',
  test: 'Test Agent',
};

const AGENT_ICONS: Record<AgentType, string> = {
  planner: '📋',
  requirements: '📝',
  architecture: '🏗️',
  'ui-ux': '🎨',
  code: '💻',
  review: '🔍',
  test: '🧪',
};

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'running':
      return <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-400" />;
    case 'waiting_approval':
      return <Clock className="w-5 h-5 text-yellow-400" />;
    case 'pending':
      return <Circle className="w-5 h-5 text-gray-600" />;
    case 'skipped':
      return <Circle className="w-5 h-5 text-gray-700" />;
    default:
      return <Circle className="w-5 h-5 text-gray-600" />;
  }
}

function getStatusText(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'running':
      return 'In Progress';
    case 'failed':
      return 'Failed';
    case 'waiting_approval':
      return 'Waiting Approval';
    case 'pending':
      return 'Waiting';
    case 'skipped':
      return 'Skipped';
    default:
      return status;
  }
}

function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'text-green-400';
    case 'running':
      return 'text-purple-400';
    case 'failed':
      return 'text-red-400';
    case 'waiting_approval':
      return 'text-yellow-400';
    case 'pending':
      return 'text-gray-500';
    case 'skipped':
      return 'text-gray-600';
    default:
      return 'text-gray-500';
  }
}

function formatDuration(ms?: number): string {
  if (!ms) return '';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function BuildTaskList({ tasks }: BuildTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No tasks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const agentName = AGENT_NAMES[task.agentType] || task.agentType;
        const agentIcon = AGENT_ICONS[task.agentType] || '🤖';
        const statusIcon = getStatusIcon(task.status);
        const statusText = getStatusText(task.status);
        const statusColor = getStatusColor(task.status);
        const isActive = task.status === 'running';
        
        // Calculate duration if task has started
        let duration = '';
        if (task.startedAt) {
          const startTime = new Date(task.startedAt);
          const endTime = task.completedAt ? new Date(task.completedAt) : new Date();
          const durationMs = endTime.getTime() - startTime.getTime();
          duration = formatDuration(durationMs);
        }

        return (
          <div
            key={task._id.toString()}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isActive
                ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10'
                : task.status === 'completed'
                ? 'bg-gray-800/50 border-gray-700'
                : task.status === 'failed'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-gray-800/30 border-gray-800'
            }`}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {statusIcon}
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{agentIcon}</span>
                <h4 className="font-medium text-white text-sm">{agentName}</h4>
                <span className={`text-xs font-medium ${statusColor}`}>
                  {statusText}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {task.description}
              </p>
              
              {/* Model info if available */}
              {task.aiUsage && (
                <p className="text-xs text-gray-600 mt-1">
                  {task.aiUsage.provider} · {task.aiUsage.model}
                </p>
              )}
            </div>

            {/* Duration */}
            {duration && (
              <div className="flex-shrink-0 text-xs text-gray-500">
                {duration}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
