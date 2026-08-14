/**
 * Security Summary Component
 * Shows overview of findings by severity
 */

'use client';

import { Shield, AlertTriangle, Info } from 'lucide-react';

interface SecuritySummaryProps {
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
}

export default function SecuritySummary({
  totalFindings,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
  infoCount,
}: SecuritySummaryProps) {
  const severityCards = [
    {
      label: 'Critical',
      count: criticalCount,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
      border: 'border-red-500/30',
      icon: AlertTriangle,
    },
    {
      label: 'High',
      count: highCount,
      color: 'text-orange-400',
      bg: 'bg-orange-900/20',
      border: 'border-orange-500/30',
      icon: AlertTriangle,
    },
    {
      label: 'Medium',
      count: mediumCount,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-500/30',
      icon: Shield,
    },
    {
      label: 'Low',
      count: lowCount,
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
      border: 'border-blue-500/30',
      icon: Info,
    },
  ];

  if (infoCount > 0) {
    severityCards.push({
      label: 'Info',
      count: infoCount,
      color: 'text-gray-400',
      bg: 'bg-gray-900/20',
      border: 'border-gray-500/30',
      icon: Info,
    });
  }

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-sm text-gray-400 mb-1">Total Findings</div>
        <div className="text-3xl font-bold text-white">{totalFindings}</div>
      </div>

      {/* Severity Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {severityCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 rounded-lg border ${card.bg} ${card.border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <div className={`text-xs font-medium ${card.color}`}>
                  {card.label}
                </div>
              </div>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
