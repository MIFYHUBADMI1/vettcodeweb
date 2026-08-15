/**
 * Architecture Overview Card
 * Displays high-level architecture description with diagram option
 */

'use client';

import { Network, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { PlanSectionCard } from './PlanSectionCard';
import { useState } from 'react';

interface ArchitecturePattern {
  name: string;
  reason: string;
}

interface PlanArchitectureCardProps {
  overview: string;
  pattern?: ArchitecturePattern;
  layers?: string[];
  keyDecisions?: string[];
  isGenerating?: boolean;
  onViewDetails?: () => void;
  onEdit?: () => void;
}

export function PlanArchitectureCard({
  overview,
  pattern,
  layers,
  keyDecisions,
  isGenerating,
  onViewDetails,
  onEdit,
}: PlanArchitectureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <PlanSectionCard
      title="Architecture Overview"
      icon={<Network className="w-5 h-5" />}
      isGenerating={isGenerating}
      headerAction={
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Edit
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>View Architecture Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Overview Text */}
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-gray-300 leading-relaxed">
            {overview}
          </p>
        </div>

        {/* Architecture Pattern */}
        {pattern && (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Network className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">
                  Architecture Pattern: {pattern.name}
                </h4>
                <p className="text-xs text-gray-400">{pattern.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Layers */}
        {layers && layers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Application Layers</h4>
            <div className="relative">
              {layers.map((layer, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-400">{index + 1}</span>
                    </div>
                    <span className="text-sm text-white">{layer}</span>
                  </div>
                  {index < layers.length - 1 && (
                    <div className="absolute left-7 top-full w-0.5 h-2 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Decisions - Collapsible */}
        {keyDecisions && keyDecisions.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-400 hover:text-white transition-colors mb-3"
            >
              <span>Key Architecture Decisions ({keyDecisions.length})</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {isExpanded && (
              <div className="space-y-2">
                {keyDecisions.map((decision, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-gray-800/30 border border-gray-700/50 rounded text-xs text-gray-300"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mt-0.5">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <span>{decision}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PlanSectionCard>
  );
}
