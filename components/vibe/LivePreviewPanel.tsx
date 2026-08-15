/**
 * Live Preview Panel Component
 * Shows live preview of the generated project (wraps existing PreviewRunner)
 */

'use client';

import { useState } from 'react';
import { ExternalLink, RefreshCw, Monitor, Tablet, Smartphone } from 'lucide-react';
import PreviewRunner from './PreviewRunner';
import { VibeProject } from '@/lib/models/VibeProject';

interface LivePreviewPanelProps {
  project: VibeProject;
  files: any[]; // VibeProjectFile[]
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export default function LivePreviewPanel({ project, files }: LivePreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    // For now, just show a message
    // In production, this would open the preview in a new tab
    window.open(`/dashboard/vibe/projects/${project._id}`, '_blank');
  };

  const hasFiles = files && files.length > 0;
  const isRunning = hasFiles; // Simplification - assume running if files exist

  // Viewport dimensions
  const viewportStyles = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Live Preview</h2>
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-green-400">Running</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Viewport mode selector */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'desktop'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'tablet'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Tablet view"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'mobile'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>

          {/* Open in new tab */}
          <button
            onClick={handleOpenNewTab}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-gray-950 rounded-lg border border-gray-800 overflow-hidden min-h-0">
        {hasFiles ? (
          <PreviewRunner
            key={refreshKey}
            files={files}
            viewport={viewportMode}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-6">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Preview Unavailable
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                No files have been generated yet. Start building to see your project come to life.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
