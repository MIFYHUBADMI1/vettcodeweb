/**
 * Generic Plan Section Card
 * Displays any plan section with consistent styling
 */

'use client';

import { ReactNode } from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface PlanSectionCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isGenerating?: boolean;
  onAddItem?: () => void;
  addItemLabel?: string;
  headerAction?: ReactNode;
}

export function PlanSectionCard({
  title,
  icon,
  children,
  isGenerating,
  onAddItem,
  addItemLabel,
  headerAction,
}: PlanSectionCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden group hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-purple-400">{icon}</div>}
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {isGenerating && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/20 rounded-full">
                <Loader2 className="w-3 h-3 text-orange-400 animate-spin" />
                <span className="text-xs text-orange-400 font-medium">Generating</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {headerAction}
            {onAddItem && !isGenerating && (
              <button
                onClick={onAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{addItemLabel || 'Add Item'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

/**
 * Loading state for section card
 */
export function PlanSectionCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-gray-800 bg-gray-900/50">
        <div className="h-5 w-32 bg-gray-800 rounded"></div>
      </div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        <div className="h-4 bg-gray-800 rounded w-4/6"></div>
      </div>
    </div>
  );
}
