/**
 * Checklist Item Component
 * Used in Goals, Features, Security, Testing sections
 */

'use client';

import { CheckCircle2, Circle, Edit2, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface PlanChecklistItemProps {
  checked?: boolean;
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDraggable?: boolean;
}

export function PlanChecklistItem({
  checked = false,
  title,
  description,
  priority,
  onToggle,
  onEdit,
  onDelete,
  isDraggable = false,
}: PlanChecklistItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-700 transition-all"
    >
      {/* Drag Handle */}
      {isDraggable && (
        <button className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="flex-shrink-0 mt-0.5 transition-all hover:scale-110"
      >
        {checked ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <Circle className="w-5 h-5 text-gray-600 group-hover:text-gray-500" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={`text-sm font-medium ${
                  checked ? 'text-gray-400 line-through' : 'text-white'
                }`}
              >
                {title}
              </h4>
              {priority && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border font-medium ${priorityColors[priority]}`}
                >
                  {priority}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {(onEdit || onDelete) && (
            <div
              className={`flex items-center gap-1 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
