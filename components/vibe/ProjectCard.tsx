/**
 * Project Card Component
 * Individual project display in grid
 */

'use client';

import { VibeProject } from '@/lib/models/VibeProject';
import Link from 'next/link';
import { Code2, Globe, Smartphone, Gamepad2, Server, Package, Calendar, FileCode } from 'lucide-react';

interface ProjectCardProps {
  project: VibeProject;
}

const projectTypeIcons = {
  web: Globe,
  mobile: Smartphone,
  game: Gamepad2,
  api: Server,
  other: Package,
};

const projectTypeColors = {
  web: 'from-blue-600 to-cyan-600',
  mobile: 'from-green-600 to-emerald-600',
  game: 'from-purple-600 to-pink-600',
  api: 'from-orange-600 to-red-600',
  other: 'from-gray-600 to-gray-700',
};

const statusColors = {
  planning: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const Icon = projectTypeIcons[project.type];
  const gradient = projectTypeColors[project.type];
  const statusClass = statusColors[project.status];
  
  const lastUpdated = new Date(project.updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  let timeAgo = '';
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    timeAgo = diffHours === 0 ? 'Just now' : `${diffHours}h ago`;
  } else if (diffDays === 1) {
    timeAgo = 'Yesterday';
  } else if (diffDays < 7) {
    timeAgo = `${diffDays}d ago`;
  } else {
    timeAgo = lastUpdated.toLocaleDateString();
  }

  return (
    <Link
      href={`/dashboard/vibe/projects/${project._id.toString()}`}
      className="group bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
    >
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      
      <div className="p-6">
        {/* Icon and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
            {project.status}
          </span>
        </div>

        {/* Project Name */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
          {project.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Framework Badge */}
        {project.framework && (
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">
              {project.framework}
            </span>
          </div>
        )}

        {/* Features Count */}
        {project.plan && (
          <div className="mb-4">
            <div className="text-xs text-gray-500">
              {project.plan.features.length} features planned
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {timeAgo}
          </div>
          
          <div className="text-xs text-purple-400 font-medium group-hover:text-purple-300">
            Open →
          </div>
        </div>
      </div>
    </Link>
  );
}
