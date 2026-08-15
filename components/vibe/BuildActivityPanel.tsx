/**
 * Build Activity Panel Component
 * Timeline of build activities
 */

'use client';

import { BuildActivity } from '@/lib/models/BuildActivity';
import { ArrowRight } from 'lucide-react';

interface BuildActivityPanelProps {
  activities: BuildActivity[];
  sessionId?: string;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'success':
      return 'text-green-400';
    case 'error':
      return 'text-red-400';
    case 'warning':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}

export default function BuildActivityPanel({
  activities,
  sessionId,
}: BuildActivityPanelProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Build Activity
        </h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No build activity yet</p>
          <p className="text-xs text-gray-600 mt-2">
            Activity will appear here when the AI team starts working
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Build Activity</h2>
        {/* View All link - commented out until we have activity detail page
        {sessionId && (
          <Link
            href={`/dashboard/vibe/builds/${sessionId}/activity`}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All
          </Link>
        )}
        */}
      </div>

      {/* Activity Timeline */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2">
        {activities.map((activity) => (
          <div
            key={activity._id.toString()}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-700 transition-colors"
          >
            {/* Icon */}
            {activity.icon && (
              <span className="text-lg flex-shrink-0 mt-0.5">
                {activity.icon}
              </span>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p
                  className={`text-sm font-medium ${getSeverityColor(
                    activity.severity
                  )}`}
                >
                  {activity.title}
                </p>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">
                {activity.message}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-gray-600">
                  {formatTime(activity.timestamp)}
                </p>
                {activity.agentType && (
                  <>
                    <span className="text-gray-700">•</span>
                    <p className="text-xs text-gray-600 capitalize">
                      {activity.agentType.replace('-', ' ')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - show count if many activities */}
      {activities.length >= 10 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Showing {activities.length} recent activities
          </p>
        </div>
      )}
    </div>
  );
}
