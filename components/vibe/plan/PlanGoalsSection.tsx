/**
 * Project Goals Section Component
 * Displays project goals with checkboxes and priorities
 */

'use client';

import { Target } from 'lucide-react';
import { PlanSectionCard } from './PlanSectionCard';
import { PlanChecklistItem } from './PlanChecklistItem';

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  userBenefit?: string;
}

interface PlanGoalsSectionProps {
  goals: Goal[];
  isGenerating?: boolean;
  onToggle?: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
  onAdd?: () => void;
}

export function PlanGoalsSection({
  goals,
  isGenerating,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: PlanGoalsSectionProps) {
  return (
    <PlanSectionCard
      title="Project Goals"
      icon={<Target className="w-5 h-5" />}
      isGenerating={isGenerating}
      onAddItem={onAdd}
      addItemLabel="Add Goal"
    >
      {goals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No goals defined yet</p>
          <p className="text-gray-500 text-xs mt-1">Add goals to define what you want to achieve</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <PlanChecklistItem
              key={goal.id}
              title={goal.title}
              description={goal.description}
              priority={goal.priority}
              onToggle={() => onToggle?.(goal.id)}
              onEdit={() => onEdit?.(goal.id)}
              onDelete={() => onDelete?.(goal.id)}
              isDraggable
            />
          ))}
        </div>
      )}
      
      {goals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{goals.filter(g => g.priority === 'high').length} High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>{goals.filter(g => g.priority === 'medium').length} Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{goals.filter(g => g.priority === 'low').length} Low</span>
            </div>
          </p>
        </div>
      )}
    </PlanSectionCard>
  );
}
