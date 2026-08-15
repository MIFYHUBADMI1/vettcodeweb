/**
 * Core Features Section Component
 * Displays core features with checkboxes, priorities, and complexity
 */

'use client';

import { Zap, Clock } from 'lucide-react';
import { PlanSectionCard } from './PlanSectionCard';
import { PlanChecklistItem } from './PlanChecklistItem';

interface Feature {
  id: string;
  name: string;
  description: string;
  userStory?: string;
  priority: 'must-have' | 'nice-to-have' | 'future';
  estimatedComplexity?: 'simple' | 'moderate' | 'complex';
}

interface PlanFeaturesSectionProps {
  features: Feature[];
  isGenerating?: boolean;
  onToggle?: (featureId: string) => void;
  onEdit?: (featureId: string) => void;
  onDelete?: (featureId: string) => void;
  onAdd?: () => void;
}

export function PlanFeaturesSection({
  features,
  isGenerating,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: PlanFeaturesSectionProps) {
  // Map priority to checklist priority
  const getPriorityColor = (priority: string): 'high' | 'medium' | 'low' => {
    if (priority === 'must-have') return 'high';
    if (priority === 'nice-to-have') return 'medium';
    return 'low';
  };

  const getComplexityBadge = (complexity?: string) => {
    if (!complexity) return null;
    
    const colors = {
      simple: 'bg-green-500/20 text-green-400 border-green-500/30',
      moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      complex: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${colors[complexity as keyof typeof colors]}`}>
        {complexity}
      </span>
    );
  };

  return (
    <PlanSectionCard
      title="Core Features"
      icon={<Zap className="w-5 h-5" />}
      isGenerating={isGenerating}
      onAddItem={onAdd}
      addItemLabel="Add Feature"
    >
      {features.length === 0 ? (
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No features defined yet</p>
          <p className="text-gray-500 text-xs mt-1">Add features to outline core functionality</p>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature.id} className="relative">
              <PlanChecklistItem
                title={feature.name}
                description={feature.description}
                priority={getPriorityColor(feature.priority)}
                onToggle={() => onToggle?.(feature.id)}
                onEdit={() => onEdit?.(feature.id)}
                onDelete={() => onDelete?.(feature.id)}
                isDraggable
              />
              {feature.estimatedComplexity && (
                <div className="absolute top-3 right-3">
                  {getComplexityBadge(feature.estimatedComplexity)}
                </div>
              )}
              {feature.userStory && (
                <div className="ml-11 mt-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded text-xs text-blue-300">
                  <span className="font-medium">User Story:</span> {feature.userStory}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {features.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{features.filter(f => f.priority === 'must-have').length} Must-Have</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{features.filter(f => f.priority === 'nice-to-have').length} Nice-to-Have</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{features.length} Total Features</span>
            </div>
          </div>
        </div>
      )}
    </PlanSectionCard>
  );
}
