/**
 * Project Requirements Panel Component
 * Displays original project idea and requirements
 */

'use client';

import { VibeProject, ProjectPlan } from '@/lib/models/VibeProject';
import { BuildSession } from '@/lib/models/BuildSession';
import { Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ProjectRequirementsPanelProps {
  project: VibeProject;
  session?: BuildSession | null;
  onEdit?: () => void;
}

export default function ProjectRequirementsPanel({
  project,
  session,
  onEdit,
}: ProjectRequirementsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const plan = project.plan || session?.artifacts?.plan;
  const requirements = session?.artifacts?.requirements;
  const architecture = session?.artifacts?.architecture;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <h2 className="text-lg font-semibold text-white">
            Project Idea & Requirements
          </h2>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Original Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Original Idea
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Project Plan */}
          {plan && (
            <>
              {/* Goal */}
              {plan.goal && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    Project Goal
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {plan.goal}
                  </p>
                </div>
              )}

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span className="text-sm text-gray-300 flex-1">
                          {typeof feature === 'string' ? feature : feature.name || feature.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pages */}
              {plan.pages && plan.pages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    Pages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.pages.map((page: any, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                      >
                        {typeof page === 'string' ? page : page.name || page.route}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {plan.techStack && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    Tech Stack
                  </h3>
                  <div className="space-y-2">
                    {plan.techStack.frontend && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 min-w-[80px]">
                          Frontend:
                        </span>
                        <span className="text-xs text-gray-300">
                          {Array.isArray(plan.techStack.frontend)
                            ? plan.techStack.frontend.join(', ')
                            : plan.techStack.frontend}
                        </span>
                      </div>
                    )}
                    {plan.techStack.styling && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 min-w-[80px]">
                          Styling:
                        </span>
                        <span className="text-xs text-gray-300">
                          {plan.techStack.styling}
                        </span>
                      </div>
                    )}
                    {plan.techStack.backend && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 min-w-[80px]">
                          Backend:
                        </span>
                        <span className="text-xs text-gray-300">
                          {Array.isArray(plan.techStack.backend)
                            ? plan.techStack.backend.join(', ')
                            : plan.techStack.backend}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Considerations */}
              {plan.securityConsiderations && plan.securityConsiderations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    Security Considerations
                  </h3>
                  <ul className="space-y-1">
                    {plan.securityConsiderations.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">⚠</span>
                        <span className="text-xs text-gray-400 flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Requirements (if available from BuildSession) */}
          {requirements && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Detailed Requirements
              </h3>
              <p className="text-xs text-gray-400">
                {typeof requirements === 'string'
                  ? requirements
                  : JSON.stringify(requirements, null, 2)}
              </p>
            </div>
          )}

          {/* Architecture Summary (if available) */}
          {architecture && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Architecture Summary
              </h3>
              <p className="text-xs text-gray-400">
                {typeof architecture === 'string'
                  ? architecture
                  : JSON.stringify(architecture, null, 2)}
              </p>
            </div>
          )}

          {/* Fallback if no plan */}
          {!plan && !requirements && !architecture && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                No requirements generated yet
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Requirements will appear here after the planning phase
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
