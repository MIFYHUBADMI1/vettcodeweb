/**
 * Security Considerations Card
 * Displays security measures and best practices
 */

'use client';

import { Shield, AlertTriangle } from 'lucide-react';
import { PlanSectionCard } from './PlanSectionCard';
import { PlanChecklistItem } from './PlanChecklistItem';

interface SecurityConsideration {
  id: string;
  title: string;
  description?: string;
  category?: 'authentication' | 'authorization' | 'data-protection' | 'api-security' | 'general';
  implemented?: boolean;
}

interface PlanSecurityCardProps {
  considerations: SecurityConsideration[];
  isGenerating?: boolean;
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function PlanSecurityCard({
  considerations,
  isGenerating,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: PlanSecurityCardProps) {
  const getCategoryColor = (category?: string) => {
    const colors = {
      authentication: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      authorization: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'data-protection': 'bg-green-500/10 text-green-400 border-green-500/20',
      'api-security': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryLabel = (category?: string) => {
    const labels = {
      authentication: 'Auth',
      authorization: 'AuthZ',
      'data-protection': 'Data',
      'api-security': 'API',
      general: 'General',
    };
    return labels[category as keyof typeof labels] || 'Security';
  };

  return (
    <PlanSectionCard
      title="Security Considerations"
      icon={<Shield className="w-5 h-5" />}
      isGenerating={isGenerating}
      onAddItem={onAdd}
      addItemLabel="Add Security Measure"
    >
      {considerations.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No security measures defined</p>
          <p className="text-gray-500 text-xs mt-1">Add security considerations to protect your app</p>
        </div>
      ) : (
        <div className="space-y-3">
          {considerations.map((item) => (
            <div key={item.id} className="relative">
              <PlanChecklistItem
                checked={item.implemented}
                title={item.title}
                description={item.description}
                onToggle={() => onToggle?.(item.id)}
                onEdit={() => onEdit?.(item.id)}
                onDelete={() => onDelete?.(item.id)}
              />
              {item.category && (
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {considerations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <Shield className="w-3 h-3" />
              <span>{considerations.filter(c => c.implemented).length} of {considerations.length} implemented</span>
            </div>
            <div className="flex items-center gap-2">
              {['authentication', 'authorization', 'data-protection', 'api-security'].map(cat => {
                const count = considerations.filter(c => c.category === cat).length;
                if (count === 0) return null;
                return (
                  <span key={cat} className={`px-2 py-0.5 rounded border ${getCategoryColor(cat)}`}>
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
