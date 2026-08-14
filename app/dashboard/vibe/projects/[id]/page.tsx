/**
 * Vibe Coder Project Workspace
 * Main development environment for a project
 */

'use client';

import { useParams } from 'next/navigation';
import { useVibeProject } from '@/lib/hooks/useVibeProjects';
import VibeWorkspace from '@/components/vibe/VibeWorkspace';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { data, isLoading, error } = useVibeProject(projectId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-gray-400 mb-6">
            {error?.message || 'This project does not exist or you do not have access to it.'}
          </p>
          <Link
            href="/dashboard/vibe"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-white transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return <VibeWorkspace project={data.project} />;
}
