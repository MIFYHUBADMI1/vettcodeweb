/**
 * Preview Controls Component
 * Control bar for preview panel (refresh, viewport, console)
 */

'use client';

import { Monitor, Tablet, Smartphone, RotateCw, ExternalLink, Terminal, X } from 'lucide-react';
import type { ViewportSize } from './PreviewPanel';

interface PreviewControlsProps {
  viewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
  showConsole: boolean;
  onToggleConsole: () => void;
  onClearConsole: () => void;
  consoleCount: number;
}

export default function PreviewControls({
  viewport,
  onViewportChange,
  showConsole,
  onToggleConsole,
  onClearConsole,
  consoleCount,
}: PreviewControlsProps) {
  const viewports: Array<{ value: ViewportSize; icon: any; label: string }> = [
    { value: 'desktop', icon: Monitor, label: 'Desktop' },
    { value: 'tablet', icon: Tablet, label: 'Tablet' },
    { value: 'mobile', icon: Smartphone, label: 'Mobile' },
  ];

  const handleRefresh = () => {
    // Force reload by remounting Sandpack
    window.location.reload();
  };

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
      {/* Left: Viewport Controls */}
      <div className="flex items-center gap-2">
        {viewports.map((vp) => {
          const Icon = vp.icon;
          return (
            <button
              key={vp.value}
              onClick={() => onViewportChange(vp.value)}
              className={`p-2 rounded-lg transition-colors ${
                viewport === vp.value
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={vp.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Console Toggle */}
        <button
          onClick={onToggleConsole}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            showConsole
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          title="Toggle console"
        >
          <Terminal className="w-4 h-4" />
          Console
          {consoleCount > 0 && (
            <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {consoleCount}
            </span>
          )}
        </button>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          title="Refresh preview"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Open in New Tab (Coming Soon) */}
        <button
          disabled
          className="p-2 text-gray-600 cursor-not-allowed rounded-lg"
          title="Open in new tab (coming soon)"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
