/**
 * Original Idea Card
 * Displays the user's original project description prominently
 */

'use client';

import { Lightbulb, Edit2 } from 'lucide-react';
import { PlanSectionCard } from './PlanSectionCard';

interface OriginalIdea {
  description: string;
  projectType?: string;
  framework?: string;
  simpleExplanation?: string;
}

interface PlanOriginalIdeaCardProps {
  idea?: OriginalIdea;
  description?: string;
  projectType?: string;
  framework?: string;
  simpleExplanation?: string;
  onEdit?: () => void;
}

export function PlanOriginalIdeaCard({
  idea,
  description: descriptionProp,
  projectType: projectTypeProp,
  framework: frameworkProp,
  simpleExplanation: simpleExplanationProp,
  onEdit,
}: PlanOriginalIdeaCardProps) {
  // Support both individual props and idea object
  const description = idea?.description || descriptionProp || '';
  const projectType = idea?.projectType || projectTypeProp;
  const framework = idea?.framework || frameworkProp;
  const simpleExplanation = idea?.simpleExplanation || simpleExplanationProp;

  // If there's no description at all, show a placeholder
  if (!description) {
    return (
      <PlanSectionCard
        title="Original Idea"
        icon={<Lightbulb className="w-5 h-5" />}
      >
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p>No project description available</p>
        </div>
      </PlanSectionCard>
    );
  }
  return (
    <PlanSectionCard
      title="Original Idea"
      icon={<Lightbulb className="w-5 h-5" />}
      headerAction={
        onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Idea</span>
          </button>
        )
      }
    >
      <div className="space-y-4">
        {/* Main Description */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          <blockquote className="pl-4 italic text-gray-300 leading-relaxed">
            "{description}"
          </blockquote>
        </div>

        {/* Simple Explanation (if available from AI) */}
        {simpleExplanation && (
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              What This Means
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {simpleExplanation}
            </p>
          </div>
        )}

        {/* Meta Information */}
        {(projectType || framework) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {projectType && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                <span className="text-xs text-gray-500">Type:</span>
                <span className="text-sm font-medium text-white capitalize">{projectType}</span>
              </div>
            )}
            {framework && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                <span className="text-xs text-gray-500">Framework:</span>
                <span className="text-sm font-medium text-white">{framework}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </PlanSectionCard>
  );
}
