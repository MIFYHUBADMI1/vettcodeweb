/**
 * Project Header Component
 * Displays project metadata, status, and actions
 */

'use client';

import { VibeProject, ProjectStatus } from '@/lib/models/VibeProject';
import { ChevronRight, Code, ExternalLink, Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface ProjectHeaderProps {
  project: VibeProject;
  onStartBuild?: () => void;
  buildInProgress?: boolean;
}

function getStatusBadge(status: ProjectStatus) {
  const badges = {
    planning: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      label: 'Planning',
    },
    active: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      label: 'Active',
    },
    archived: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-400',
      label: 'Archived',
    },
  };

  const badge = badges[status] || badges.planning;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {badge.label}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ProjectHeader({
  project,
  onStartBuild,
  buildInProgress,
}: ProjectHeaderProps) {
  const router = useRouter();

  const handleOpenWorkspace = () => {
    router.push(`/dashboard/vibe/projects/${project._id}`);
  };

  const handleShare = () => {
    // Copy project URL to clipboard
    const url = `${window.location.origin}/dashboard/vibe/projects/${project._id}/overview`;
    navigator.clipboard.writeText(url);
    toast.success('Project link copied to clipboard');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/dashboard/vibe"
          className="hover:text-gray-300 transition-colors"
        >
          Vibe Projects
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300">{project.name}</span>
      </div>

      {/* Project Title & Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {project.name}
            </h1>
            {getStatusBadge(project.status)}
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">
            {project.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* View Plan button */}
          <Link
            href={`/dashboard/vibe/projects/${project._id}/plan`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-gray-300 transition-colors"
            title="View build plan"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">View Plan</span>
          </Link>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="Copy link"
          >
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </button>

          {/* Open in Workspace button */}
          <button
            onClick={handleOpenWorkspace}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-gray-300 transition-colors"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Open in Workspace</span>
          </button>

          {/* Build with AI Team button (if not building) */}
          {onStartBuild && !buildInProgress && (
            <button
              onClick={onStartBuild}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium text-white transition-all shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Build with AI Team
            </button>
          )}

          {/* Building indicator */}
          {buildInProgress && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-sm font-medium text-purple-400">
                Building...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Pills */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {/* Type */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600">Type:</span>
          <span className="px-2 py-1 bg-gray-800 rounded text-gray-300 capitalize">
            {project.type}
          </span>
        </div>

        {/* Framework */}
        {project.framework && (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600">Framework:</span>
            <span className="px-2 py-1 bg-gray-800 rounded text-gray-300">
              {project.framework}
            </span>
          </div>
        )}

        {/* Created */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600">Created:</span>
          <span className="text-gray-400">
            {formatDate(project.createdAt)}
          </span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600">Updated:</span>
          <span className="text-gray-400">
            {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
