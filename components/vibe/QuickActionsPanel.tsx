/**
 * Quick Actions Panel Component
 * Provides quick access to common project actions
 */

'use client';

import { MessageSquare, Code, Shield, Rocket, Play, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface QuickActionsPanelProps {
  projectId: string;
  canResumeBuild?: boolean;
  onResumeBuild?: () => void;
  onRunScan?: () => void;
}

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
}

export default function QuickActionsPanel({
  projectId,
  canResumeBuild,
  onResumeBuild,
  onRunScan,
}: QuickActionsPanelProps) {
  const router = useRouter();

  const handleChatWithAI = () => {
    router.push(`/dashboard/vibe/projects/${projectId}`);
    // Focus on chat panel
  };

  const handleViewCode = () => {
    router.push(`/dashboard/vibe/projects/${projectId}`);
  };

  const handleRunSecurityScan = () => {
    if (onRunScan) {
      onRunScan();
    } else {
      toast.info('Security scan feature');
    }
  };

  const handleDeploy = () => {
    // Deploy is not implemented yet
    toast.info('Deploy feature coming soon');
  };

  const actions: QuickAction[] = [
    // Continue Building (only show if build can be resumed)
    ...(canResumeBuild && onResumeBuild
      ? [
          {
            icon: <Play className="w-5 h-5" />,
            title: 'Continue Building',
            description: 'Resume the AI build process',
            onClick: onResumeBuild,
            color: 'text-purple-400',
          },
        ]
      : []),
    // Chat with AI
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Chat with AI',
      description: 'Ask questions or request changes',
      onClick: handleChatWithAI,
      color: 'text-blue-400',
    },
    // View Code
    {
      icon: <Code className="w-5 h-5" />,
      title: 'View Code',
      description: 'Open in code editor',
      onClick: handleViewCode,
      color: 'text-green-400',
    },
    // Run Security Scan
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Run Security Scan',
      description: 'Scan for vulnerabilities',
      onClick: handleRunSecurityScan,
      color: 'text-yellow-400',
    },
    // Deploy (commented out until implemented)
    /*
    {
      icon: <Rocket className="w-5 h-5" />,
      title: 'Deploy Preview',
      description: 'Deploy to preview environment',
      onClick: handleDeploy,
      color: 'text-indigo-400',
      disabled: true,
    },
    */
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      {/* Header */}
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>

      {/* Actions List */}
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
              action.disabled
                ? 'bg-gray-800/30 border-gray-800 cursor-not-allowed opacity-50'
                : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-700 hover:bg-gray-800'
            }`}
          >
            {/* Icon */}
            <div className={`flex-shrink-0 ${action.color || 'text-gray-400'}`}>
              {action.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white mb-0.5">
                {action.title}
              </p>
              <p className="text-xs text-gray-400">{action.description}</p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
