/**
 * Tech Stack Section Component
 * Displays technology selections with icons and descriptions
 */

'use client';

import { Code2, Palette, Database, Shield, Cloud, Package } from 'lucide-react';
import { PlanSectionCard } from './PlanSectionCard';

interface TechStackItem {
  name: string;
  why?: string;
}

interface PlanTechStackCardProps {
  techStack: {
    framework?: TechStackItem;
    language?: TechStackItem;
    styling?: TechStackItem;
    uiComponents?: TechStackItem;
    database?: TechStackItem;
    orm?: TechStackItem;
    authentication?: TechStackItem;
    hosting?: TechStackItem;
  };
  onEdit?: () => void;
}

export function PlanTechStackCard({ techStack, onEdit }: PlanTechStackCardProps) {
  const techItems = [
    {
      key: 'framework',
      label: 'Framework',
      icon: <Code2 className="w-4 h-4" />,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      key: 'language',
      label: 'Language',
      icon: <Code2 className="w-4 h-4" />,
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    {
      key: 'styling',
      label: 'Styling',
      icon: <Palette className="w-4 h-4" />,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
    {
      key: 'uiComponents',
      label: 'UI Components',
      icon: <Package className="w-4 h-4" />,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      key: 'database',
      label: 'Database',
      icon: <Database className="w-4 h-4" />,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    {
      key: 'orm',
      label: 'ORM',
      icon: <Database className="w-4 h-4" />,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    },
    {
      key: 'authentication',
      label: 'Auth',
      icon: <Shield className="w-4 h-4" />,
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    {
      key: 'hosting',
      label: 'Hosting',
      icon: <Cloud className="w-4 h-4" />,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <PlanSectionCard
      title="Tech Stack"
      icon={<Code2 className="w-5 h-5" />}
      headerAction={
        onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Edit Stack
          </button>
        )
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {techItems.map((item) => {
          const tech = techStack[item.key as keyof typeof techStack];
          if (!tech) return null;

          return (
            <div
              key={item.key}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 transition-colors"
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-white truncate">
                  {tech.name}
                </p>
                {tech.why && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {tech.why}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PlanSectionCard>
  );
}
