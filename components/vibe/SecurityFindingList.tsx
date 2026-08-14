/**
 * Security Finding List Component
 * Displays list of security findings with filtering
 */

'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import SecurityFindingCard from './SecurityFindingCard';
import type { NormalizedFinding } from '@/lib/types';

interface SecurityFindingListProps {
  findings: NormalizedFinding[];
  projectId: string;
}

type SeverityFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export default function SecurityFindingList({ findings, projectId }: SecurityFindingListProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Get unique categories
  const categories = Array.from(
    new Set(findings.map(f => f.category).filter(Boolean))
  );

  // Filter findings
  const filteredFindings = findings.filter(finding => {
    if (severityFilter !== 'ALL' && finding.severity !== severityFilter) {
      return false;
    }
    if (categoryFilter !== 'ALL' && finding.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
        <Filter className="w-4 h-4 text-gray-400" />
        
        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
          className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="INFO">Info</option>
        </select>

        {/* Category Filter */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

        {/* Count */}
        <div className="ml-auto text-sm text-gray-400">
          {filteredFindings.length} {filteredFindings.length === 1 ? 'finding' : 'findings'}
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No findings match your filters
          </div>
        ) : (
          filteredFindings.map((finding, index) => (
            <SecurityFindingCard
              key={`${finding.filePath}-${finding.lineNumber}-${index}`}
              finding={finding}
              projectId={projectId}
            />
          ))
        )}
      </div>
    </div>
  );
}
