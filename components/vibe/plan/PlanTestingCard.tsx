/**
 * Build & Testing Strategy Card
 * Displays testing approach and quality assurance measures
 */

'use client';

import { TestTube, CheckCircle2 } from 'lucide-react';
import { PlanSectionCard } from './PlanSectionCard';
import { PlanChecklistItem } from './PlanChecklistItem';

interface TestingStrategy {
  id: string;
  title: string;
  description?: string;
  type?: 'unit' | 'integration' | 'e2e' | 'performance' | 'accessibility' | 'general';
  implemented?: boolean;
}

interface PlanTestingCardProps {
  strategies: TestingStrategy[];
  coverageTarget?: number;
  isGenerating?: boolean;
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function PlanTestingCard({
  strategies,
  coverageTarget,
  isGenerating,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: PlanTestingCardProps) {
  const getTypeColor = (type?: string) => {
    const colors = {
      unit: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      integration: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      e2e: 'bg-green-500/10 text-green-400 border-green-500/20',
      performance: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      accessibility: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const getTypeLabel = (type?: string) => {
    const labels = {
      unit: 'Unit',
      integration: 'Integration',
      e2e: 'E2E',
      performance: 'Performance',
      accessibility: 'A11y',
      general: 'General',
    };
    return labels[type as keyof typeof labels] || 'Test';
  };

  return (
    <PlanSectionCard
      title="Build & Testing Strategy"
      icon={<TestTube className="w-5 h-5" />}
      isGenerating={isGenerating}
      onAddItem={onAdd}
      addItemLabel="Add Test Strategy"
    >
      {strategies.length === 0 ? (
        <div className="text-center py-8">
          <TestTube className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No testing strategy defined</p>
          <p className="text-gray-500 text-xs mt-1">Add testing approaches to ensure quality</p>
        </div>
      ) : (
        <>
          {/* Coverage Target */}
          {coverageTarget && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Coverage Target</h4>
                  <p className="text-xs text-gray-400">Aim for {coverageTarget}% code coverage</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-800"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - coverageTarget / 100)}`}
                        className="text-green-400"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-400">{coverageTarget}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strategies */}
          <div className="space-y-3">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="relative">
                <PlanChecklistItem
                  checked={strategy.implemented}
                  title={strategy.title}
                  description={strategy.description}
                  onToggle={() => onToggle?.(strategy.id)}
                  onEdit={() => onEdit?.(strategy.id)}
                  onDelete={() => onDelete?.(strategy.id)}
                />
                {strategy.type && (
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getTypeColor(strategy.type)}`}>
                      {getTypeLabel(strategy.type)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {strategies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <CheckCircle2 className="w-3 h-3" />
              <span>{strategies.filter(s => s.implemented).length} of {strategies.length} strategies</span>
            </div>
            <div className="flex items-center gap-2">
              {['unit', 'integration', 'e2e'].map(type => {
                const count = strategies.filter(s => s.type === type).length;
                if (count === 0) return null;
                return (
                  <span key={type} className={`px-2 py-0.5 rounded border ${getTypeColor(type)}`}>
                    {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PlanSectionCard>
  );
}
