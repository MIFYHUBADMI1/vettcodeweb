/**
 * Preview Panel Component
 * Main container for live preview functionality
 */

'use client';

import { useState } from 'react';
import { useVibeProjectFiles } from '@/lib/hooks/useVibeProjects';
import { VibeProject } from '@/lib/models/VibeProject';
import PreviewRunner from './PreviewRunner';
import PreviewControls from './PreviewControls';
import PreviewConsole from './PreviewConsole';
import { isPreviewable } from '@/lib/utils/sandpack-converter';
import { AlertCircle, Loader2, Code } from 'lucide-react';

interface PreviewPanelProps {
  projectId: string;
  project: VibeProject;
}

export type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPanel({ projectId, project }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<Array<{
    type: 'log' | 'warn' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  const { data: filesData, isLoading } = useVibeProjectFiles(projectId);
  const files = filesData?.files || [];

  // Check if project can be previewed
  const previewCheck = isPreviewable(files);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!previewCheck.canPreview) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950 p-8">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            Preview Not Available
          </h3>
          <p className="text-gray-400 mb-6">
            {previewCheck.reason || 'This project cannot be previewed in the browser.'}
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-left">
            <h4 className="text-sm font-semibold text-white mb-2">To enable preview:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Create an index.html or index.tsx file</li>
              <li>• Use React, Vue, or vanilla JavaScript</li>
              <li>• Frontend code only (no backend)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const handleConsoleMessage = (type: 'log' | 'warn' | 'error', message: string) => {
    setConsoleMessages(prev => [
      ...prev,
      { type, message, timestamp: new Date() }
    ]);
  };

  const handleClearConsole = () => {
    setConsoleMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Controls */}
      <PreviewControls
        viewport={viewport}
        onViewportChange={setViewport}
        showConsole={showConsole}
        onToggleConsole={() => setShowConsole(!showConsole)}
        onClearConsole={handleClearConsole}
        consoleCount={consoleMessages.length}
      />

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        <PreviewRunner
          files={files}
          viewport={viewport}
          onConsoleMessage={handleConsoleMessage}
        />
      </div>

      {/* Console Drawer */}
      {showConsole && (
        <PreviewConsole
          messages={consoleMessages}
          onClear={handleClearConsole}
          onClose={() => setShowConsole(false)}
        />
      )}
    </div>
  );
}
