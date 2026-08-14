/**
 * Security Finding Card Component
 * Displays a single security finding with details and fix action
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, ExternalLink, AlertTriangle, Shield, Info } from 'lucide-react';
import SecurityFixModal from './SecurityFixModal';
import type { NormalizedFinding } from '@/lib/types';

interface SecurityFindingCardProps {
  finding: NormalizedFinding;
  projectId: string;
}

export default function SecurityFindingCard({ finding, projectId }: SecurityFindingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);

  // Severity styling
  const severityConfig = {
    CRITICAL: {
      color: 'text-red-400',
      bg: 'bg-red-900/20',
      border: 'border-red-500/30',
      icon: AlertTriangle,
    },
    HIGH: {
      color: 'text-orange-400',
      bg: 'bg-orange-900/20',
      border: 'border-orange-500/30',
      icon: AlertTriangle,
    },
    MEDIUM: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-500/30',
      icon: Shield,
    },
    LOW: {
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
      border: 'border-blue-500/30',
      icon: Info,
    },
    INFO: {
      color: 'text-gray-400',
      bg: 'bg-gray-900/20',
      border: 'border-gray-500/30',
      icon: Info,
    },
  };

  const config = severityConfig[finding.severity] || severityConfig.INFO;
  const Icon = config.icon;

  return (
    <>
      <div className={`rounded-lg border ${config.border} ${config.bg} overflow-hidden`}>
        {/* Header */}
        <div
          className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start gap-3">
            {/* Expand Icon */}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            )}

            {/* Severity Icon */}
            <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title & Severity Badge */}
              <div className="flex items-start gap-2 mb-2">
                <h4 className="font-semibold text-white flex-1">
                  {finding.title}
                </h4>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bg} border ${config.border}`}>
                  {finding.severity}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-400 mb-2">
                {finding.message}
              </p>

              {/* Location */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="font-mono">
                  {finding.filePath}
                  {finding.lineNumber && `:${finding.lineNumber}`}
                </div>
                {finding.category && (
                  <div className="px-2 py-0.5 bg-gray-800 rounded">
                    {finding.category}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-800/50">
            {/* Code Snippet */}
            {finding.codeSnippet && (
              <div>
                <div className="text-sm font-medium text-gray-400 mb-2">Code</div>
                <pre className="p-3 bg-gray-950 rounded text-xs overflow-x-auto">
                  <code className="text-gray-300">{finding.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* CWE */}
            {finding.cwe && finding.cwe.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-400 mb-2">CWE</div>
                <div className="flex flex-wrap gap-2">
                  {finding.cwe.map(cwe => (
                    <span
                      key={cwe}
                      className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                    >
                      {cwe}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {finding.references && finding.references.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-400 mb-2">References</div>
                <div className="space-y-1">
                  {finding.references.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {ref}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFixModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Fix with AI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fix Modal */}
      {showFixModal && (
        <SecurityFixModal
          finding={finding}
          projectId={projectId}
          onClose={() => setShowFixModal(false)}
        />
      )}
    </>
  );
}
