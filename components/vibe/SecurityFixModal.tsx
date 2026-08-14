/**
 * Security Fix Modal Component
 * Shows AI-generated fix suggestion with diff
 */

'use client';

import { useState } from 'react';
import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import type { NormalizedFinding } from '@/lib/types';
import { useVibeProjectFiles, useUpdateFile } from '@/lib/hooks/useVibeProjects';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

interface SecurityFixModalProps {
  finding: NormalizedFinding;
  projectId: string;
  onClose: () => void;
}

export default function SecurityFixModal({ finding, projectId, onClose }: SecurityFixModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [fix, setFix] = useState<{
    explanation: string;
    fixedCode: string;
    whySecure: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: filesData } = useVibeProjectFiles(projectId);
  const updateFile = useUpdateFile(projectId);
  
  const files = filesData?.files || [];
  const targetFile = files.find(f => f.path === finding.filePath || f.path === `/${finding.filePath}`);

  const handleGenerateFix = async () => {
    if (!targetFile) {
      toast.error('File not found');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/vibe/projects/${projectId}/security/fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding,
          fileContent: targetFile.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate fix');
      }

      const data = await response.json();
      setFix(data.fix);
    } catch (err) {
      console.error('Failed to generate fix:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate fix');
      toast.error('Failed to generate fix');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyFix = async () => {
    if (!fix || !targetFile) return;

    setIsApplying(true);

    try {
      await updateFile.mutateAsync({
        path: targetFile.path,
        content: fix.fixedCode,
      });

      toast.success('Fix applied successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to apply fix:', err);
      toast.error('Failed to apply fix');
    } finally {
      setIsApplying(false);
    }
  };

  // Auto-generate on mount
  useState(() => {
    if (!fix && !isGenerating && !error) {
      handleGenerateFix();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">AI Security Fix</h2>
            <p className="text-sm text-gray-400">{finding.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* File Info */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">File</div>
            <div className="font-mono text-sm text-white">{finding.filePath}</div>
            {finding.lineNumber && (
              <div className="text-xs text-gray-500 mt-1">Line {finding.lineNumber}</div>
            )}
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Generating Secure Fix
                </h3>
                <p className="text-gray-400">
                  AI is analyzing the vulnerability and creating a fix...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isGenerating && (
            <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-400 mb-2">Failed to Generate Fix</h4>
                  <p className="text-sm text-gray-300 mb-4">{error}</p>
                  <button
                    onClick={handleGenerateFix}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fix Display */}
          {fix && !isGenerating && (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-800">
                <button className="px-4 py-2 border-b-2 border-purple-500 text-purple-400 font-medium text-sm">
                  Explanation
                </button>
              </div>

              {/* Explanation */}
              <div>
                <h4 className="font-semibold text-white mb-3">What's Wrong</h4>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{fix.explanation}</ReactMarkdown>
                </div>
              </div>

              {/* Fixed Code */}
              <div>
                <h4 className="font-semibold text-white mb-3">Fixed Code</h4>
                <pre className="p-4 bg-gray-950 rounded-lg overflow-x-auto text-sm">
                  <code className="text-gray-300">{fix.fixedCode}</code>
                </pre>
              </div>

              {/* Why Secure */}
              <div>
                <h4 className="font-semibold text-white mb-3">Why This Is Secure</h4>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{fix.whySecure}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {fix && !isGenerating && (
          <div className="p-6 border-t border-gray-800 flex gap-3">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFix}
              disabled={isApplying}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Apply Fix
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
