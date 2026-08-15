/**
 * Files Changed Panel Component
 * Shows recently created/modified files
 */

'use client';

import { VibeProjectFile } from '@/lib/models/VibeProjectFile';
import { File, FileCode, FileJson, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FilesChangedPanelProps {
  files: VibeProjectFile[];
  projectId: string;
  limit?: number;
}

function getFileIcon(language: string) {
  switch (language) {
    case 'javascript':
    case 'typescript':
    case 'jsx':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-400" />;
    case 'html':
    case 'css':
    case 'scss':
      return <FileText className="w-4 h-4 text-purple-400" />;
    case 'markdown':
      return <FileText className="w-4 h-4 text-gray-400" />;
    default:
      return <File className="w-4 h-4 text-gray-500" />;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function FilesChangedPanel({
  files,
  projectId,
  limit = 10,
}: FilesChangedPanelProps) {
  const router = useRouter();

  // Sort by most recently updated and limit
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);

  const handleViewAll = () => {
    router.push(`/dashboard/vibe/projects/${projectId}`);
  };

  if (recentFiles.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Files Changed
        </h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No files yet</p>
          <p className="text-xs text-gray-600 mt-2">
            Files will appear here as the AI team creates them
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Files Changed</h2>
        <button
          onClick={handleViewAll}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2">
        {recentFiles.map((file) => (
          <div
            key={file._id.toString()}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-700 transition-colors cursor-pointer"
            onClick={() => router.push(`/dashboard/vibe/projects/${projectId}`)}
          >
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(file.language)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {file.path}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-600">
                  {formatSize(file.size)}
                </span>
                <span className="text-gray-700">•</span>
                <span className="text-xs text-gray-600">
                  {getTimeAgo(file.updatedAt)}
                </span>
                {file.lastEditedBy === 'ai' && (
                  <>
                    <span className="text-gray-700">•</span>
                    <span className="text-xs text-purple-400">AI</span>
                  </>
                )}
              </div>
            </div>

            {/* Change indicator */}
            {file.version > 1 && (
              <div className="flex-shrink-0">
                <span className="text-xs text-yellow-400">~</span>
              </div>
            )}
            {file.version === 1 && (
              <div className="flex-shrink-0">
                <span className="text-xs text-green-400">+</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {files.length > limit && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Showing {limit} of {files.length} files
          </p>
        </div>
      )}
    </div>
  );
}
