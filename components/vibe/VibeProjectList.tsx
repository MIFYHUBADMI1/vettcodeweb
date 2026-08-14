/**
 * Vibe Project List Component
 * Displays grid of user's projects
 */

'use client';

import { VibeProject } from '@/lib/models/VibeProject';
import ProjectCard from './ProjectCard';

interface VibeProjectListProps {
  projects: VibeProject[];
}

export default function VibeProjectList({ projects }: VibeProjectListProps) {
  const sortedProjects = [...projects].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Your Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <ProjectCard key={project._id.toString()} project={project} />
        ))}
      </div>
    </div>
  );
}
