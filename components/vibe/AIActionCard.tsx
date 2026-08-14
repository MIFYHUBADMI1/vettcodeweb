/**
 * AI Action Card Component
 * Display and execute AI-proposed actions
 */

'use client';

import { useState } from 'react';
import { AIAction } from '@/lib/models/VibeConversation';
import { useCreateFile, useUpdateFile, useDeleteFile } from '@/lib/hooks/useVibeProjects';
import { FilePlus, FilePen, FileX, Package, Terminal, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface AIActionCardProps {
  action: AIAction;
  projectId: string;
  messageId: string;
}

const actionIcons = {
  create_file: FilePlus,
  update_file: FilePen,
  delete_file: FileX,
  install_dependency: Package,
  run_command: Terminal,
};

const actionColors = {
  create_file: 'from-green-600 to-emerald-600',
  update_file: 'from-blue-600 to-cyan-600',
  delete_file: 'from-red-600 to-orange-600',
  install_dependency: 'from-purple-600 to-pink-600',
  run_command: 'from-yellow-600 to-orange-600',
};

const statusColors = {
  pending: 'border-yellow-500/30 bg-yellow-500/10',
  approved: 'border-blue-500/30 bg-blue-500/10',
  executed: 'border-green-500/30 bg-green-500/10',
  rejected: 'border-red-500/30 bg-red-500/10',
  failed: 'border-red-500/30 bg-red-500/10',
};

export default function AIActionCard({ action, projectId, messageId }: AIActionCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [localStatus, setLocalStatus] = useState(action.status);
  const [error, setError] = useState<string | null>(null);

  const createFile = useCreateFile(projectId);
  const updateFile = useUpdateFile(projectId);
  const deleteFile = useDeleteFile(projectId);

  const Icon = actionIcons[action.type];
  const gradient = actionColors[action.type];
  const statusColor = statusColors[localStatus];

  const handleApprove = async () => {
    setIsExecuting(true);
    setError(null);
    setLocalStatus('approved');

    try {
      // Execute based on action type
      switch (action.type) {
        case 'create_file':
          await createFile.mutateAsync({
            path: action.target,
            content: action.payload.content,
          });
          toast.success(`Created ${action.target}`);
          break;

        case 'update_file':
          await updateFile.mutateAsync({
            path: action.target,
            content: action.payload.content,
          });
          toast.success(`Updated ${action.target}`);
          break;

        case 'delete_file':
          await deleteFile.mutateAsync(action.target);
          toast.success(`Deleted ${action.target}`);
          break;

        case 'install_dependency':
          toast.info(`Dependency installation coming soon: ${action.target}`);
          setLocalStatus('pending');
          setIsExecuting(false);
          return;

        case 'run_command':
          toast.info('Command execution coming soon');
          setLocalStatus('pending');
          setIsExecuting(false);
          return;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      setLocalStatus('executed');
      
      // TODO: Update action status in database
      // await updateActionStatus(projectId, messageId, action.id, 'executed');
    } catch (err) {
      console.error('Failed to execute action:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute action';
      setError(errorMessage);
      setLocalStatus('failed');
      toast.error(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReject = () => {
    setLocalStatus('rejected');
    toast.info('Action rejected');
    
    // TODO: Update action status in database
    // await updateActionStatus(projectId, messageId, action.id, 'rejected');
  };

  return (
    <div className={`border rounded-lg p-3 ${statusColor}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white capitalize">
              {action.type.replace('_', ' ')}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {localStatus}
            </span>
          </div>

          <p className="text-sm text-gray-300 mb-2 truncate" title={action.target}>
            {action.target}
          </p>

          {/* Preview for file operations */}
          {(action.type === 'create_file' || action.type === 'update_file') && action.payload.content && (
            <details className="mb-2">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                Preview content
              </summary>
              <pre className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400 overflow-x-auto max-h-32">
                {action.payload.content.substring(0, 500)}
                {action.payload.content.length > 500 && '...'}
              </pre>
            </details>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-2 bg-red-900/20 rounded mb-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {localStatus === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={isExecuting}
                className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded text-xs font-medium text-white transition-colors flex items-center justify-center gap-1"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    Apply
                  </>
                )}
              </button>
              <button
                onClick={handleReject}
                disabled={isExecuting}
                className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded text-xs font-medium text-white transition-colors flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
            </div>
          )}

          {/* Status indicators */}
          {localStatus === 'executed' && (
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <Check className="w-3 h-3" />
              <span>Executed successfully</span>
            </div>
          )}

          {localStatus === 'rejected' && (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <X className="w-3 h-3" />
              <span>Rejected</span>
            </div>
          )}

          {localStatus === 'failed' && (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Failed to execute</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
