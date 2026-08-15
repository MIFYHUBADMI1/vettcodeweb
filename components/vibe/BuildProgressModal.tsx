/**
 * Build Progress Modal
 * Shows AI Build Team progress in real-time
 */

'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Bot } from 'lucide-react';

interface BuildActivity {
  _id: string;
  type: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  icon?: string;
}

interface BuildSession {
  _id: string;
  status: string;
  phase: string;
  progress: number;
  results: {
    filesGenerated: number;
    tasksCompleted: number;
  };
}

interface BuildProgressModalProps {
  sessionId: string;
  projectId: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function BuildProgressModal({
  sessionId,
  projectId,
  onClose,
  onComplete,
}: BuildProgressModalProps) {
  const [session, setSession] = useState<BuildSession | null>(null);
  const [activities, setActivities] = useState<BuildActivity[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Poll for status updates
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/vibe/builds/${sessionId}/status`);
        if (response.ok) {
          const data = await response.json();
          setSession(data.session);

          if (data.session.status === 'ready') {
            setIsComplete(true);
            setTimeout(() => {
              onComplete();
            }, 2000);
          } else if (data.session.status === 'failed') {
            setIsComplete(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch build status:', error);
      }
    };

    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/vibe/builds/${sessionId}/activities`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchStatus();
    fetchActivities();

    const statusInterval = setInterval(fetchStatus, 2000);
    const activityInterval = setInterval(fetchActivities, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(activityInterval);
    };
  }, [sessionId, onComplete]);

  const getPhaseIcon = (phase: string) => {
    if (isComplete && session?.status === 'ready') return '✅';
    if (session?.status === 'failed') return '❌';
    
    switch (phase) {
      case 'planning': return '📋';
      case 'requirements': return '📝';
      case 'architecture': return '🏗️';
      case 'ui-design': return '🎨';
      case 'code-generation': return '💻';
      case 'review': return '🔍';
      case 'testing': return '🧪';
      default: return '🤖';
    }
  };

  const getActivityIcon = (activity: BuildActivity) => {
    if (activity.icon) return activity.icon;
    
    switch (activity.type) {
      case 'agent_started': return '🤖';
      case 'agent_completed': return '✓';
      case 'file_created': return '📄';
      case 'phase_changed': return '🔄';
      case 'error': return '⚠️';
      default: return '•';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              {session?.status === 'ready' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : session?.status === 'failed' ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <Bot className="w-6 h-6 text-purple-400 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {session?.status === 'ready' ? '✨ Build Complete!' : 
                 session?.status === 'failed' ? 'Build Failed' :
                 'AI Build Team Working...'}
              </h2>
              <p className="text-sm text-gray-400">
                {session?.phase && `Phase: ${session.phase}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        {session && (
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                {getPhaseIcon(session.phase)} {session.phase || 'Starting...'}
              </span>
              <span className="text-sm text-gray-400">{session.progress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${session.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{session.results.tasksCompleted} tasks completed</span>
              <span>{session.results.filesGenerated} files generated</span>
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Initializing AI Build Team...</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity._id}
                  className={`flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 ${
                    activity.severity === 'error' ? 'border-red-500/20' :
                    activity.severity === 'success' ? 'border-green-500/20' :
                    ''
                  }`}
                >
                  <span className="text-lg">{getActivityIcon(activity)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm ${getSeverityColor(activity.severity)}`}>
                        {activity.title}
                      </p>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{activity.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="p-6 border-t border-gray-800">
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium text-white transition-all"
            >
              {session?.status === 'ready' ? 'View Generated Code' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
