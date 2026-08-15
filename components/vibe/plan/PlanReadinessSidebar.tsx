/**
 * Plan Readiness Sidebar
 * Shows completion status and checklist
 */

'use client';

import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { PlanProgressCircle } from './PlanProgressCircle';

interface ReadinessItem {
  label: string;
  completed: boolean;
  warning?: boolean;
}

interface PlanReadinessSidebarProps {
  progress: number;
  checklist?: ReadinessItem[];
  dataStructure?: {
    name: string;
    fields: string;
  }[];
  status?: string;
}

export function PlanReadinessSidebar({
  progress,
  checklist = [],
  dataStructure,
  status,
}: PlanReadinessSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Progress Circle */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          Plan Summary
        </h3>
        
        <div className="flex flex-col items-center">
          <PlanProgressCircle progress={progress} />
          
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-white">Plan Readiness</p>
            <p className="text-sm text-gray-400 mt-1">
              {progress >= 100 
                ? 'Ready to build!' 
                : status === 'generating' 
                ? 'Generating plan...' 
                : 'Almost ready to build!'}
            </p>
          </div>
        </div>
      </div>

      {/* Readiness Checklist */}
      {checklist.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Readiness Checklist</h3>
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                {item.warning ? (
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                ) : item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-sm ${
                    item.warning
                      ? 'text-yellow-400'
                      : item.completed
                      ? 'text-gray-300'
                      : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Structure Preview */}
      {dataStructure && dataStructure.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">Data Structure (High Level)</h3>
            <button className="text-xs text-purple-400 hover:text-purple-300">
              View Full Schema
            </button>
          </div>
          
          <div className="space-y-2">
            {dataStructure.slice(0, 4).map((model, index) => (
              <div
                key={index}
                className="bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{model.name}</span>
                  <span className="text-xs text-gray-500">Model</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{model.fields}</p>
              </div>
            ))}
            
            {dataStructure.length > 4 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{dataStructure.length - 4} more models
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
