/**
 * Preview Runner Component
 * Sandpack integration for live code execution
 */

'use client';

import { useEffect, useState } from 'react';
import { VibeProjectFile } from '@/lib/models/VibeProjectFile';
import { 
  convertFilesToSandpack, 
  detectTemplate, 
  getDefaultFiles,
  type SandpackTemplate 
} from '@/lib/utils/sandpack-converter';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ViewportSize } from './PreviewPanel';

// Dynamically import Sandpack (only on client)
const Sandpack = dynamic(
  () => import('@codesandbox/sandpack-react').then(mod => mod.Sandpack),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    ),
  }
);

interface PreviewRunnerProps {
  files: VibeProjectFile[];
  viewport: ViewportSize;
  onConsoleMessage?: (type: 'log' | 'warn' | 'error', message: string) => void;
}

const viewportDimensions: Record<ViewportSize, { width: string; height: string }> = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
};

export default function PreviewRunner({ files, viewport, onConsoleMessage }: PreviewRunnerProps) {
  const [template, setTemplate] = useState<SandpackTemplate>('react-ts');
  const [sandpackFiles, setSandpackFiles] = useState<any>({});
  const [key, setKey] = useState(0); // Force remount on file changes

  useEffect(() => {
    if (files.length === 0) return;

    // Detect template
    const detectedTemplate = detectTemplate(files);
    setTemplate(detectedTemplate);

    // Convert files
    const converted = convertFilesToSandpack(files);
    
    // Merge with defaults if needed
    const defaults = getDefaultFiles(detectedTemplate);
    const merged = { ...defaults, ...converted };
    
    setSandpackFiles(merged);

    // Force remount to reload preview
    setKey(prev => prev + 1);
  }, [files]);

  if (Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <p className="text-gray-500">No files to preview</p>
      </div>
    );
  }

  const dimensions = viewportDimensions[viewport];

  return (
    <div className="h-full overflow-auto bg-gray-900 flex items-center justify-center">
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100%',
          maxHeight: '100%',
          transition: 'all 0.3s ease',
        }}
      >
        <Sandpack
          key={key}
          template={template}
          files={sandpackFiles}
          theme="dark"
          options={{
            showNavigator: false,
            showTabs: false,
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: '100%',
            editorWidthPercentage: 0, // Hide editor, show only preview
            classes: {
              'sp-wrapper': 'sandpack-wrapper',
              'sp-layout': 'sandpack-layout',
              'sp-preview': 'sandpack-preview',
            },
          }}
          customSetup={{
            dependencies: {
              // Add common dependencies
              'react': '^18.2.0',
              'react-dom': '^18.2.0',
            },
          }}
        />
      </div>
    </div>
  );
}
