/**
 * Create Project Modal
 * Dialog for creating new Vibe Coder projects
 */

'use client';

import { useState } from 'react';
import { useCreateProject } from '@/lib/hooks/useVibeProjects';
import { ProjectType } from '@/lib/models/VibeProject';
import { X, Loader2, Globe, Smartphone, Gamepad2, Server, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface CreateProjectModalProps {
  onClose: () => void;
}

const projectTypes: Array<{
  value: ProjectType;
  label: string;
  icon: any;
  description: string;
  color: string;
}> = [
  {
    value: 'web',
    label: 'Website',
    icon: Globe,
    description: 'Portfolio, blog, landing page',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    value: 'web',
    label: 'Web App',
    icon: Globe,
    description: 'Interactive application',
    color: 'from-green-600 to-emerald-600',
  },
  {
    value: 'mobile',
    label: 'Mobile App',
    icon: Smartphone,
    description: 'iOS or Android application',
    color: 'from-purple-600 to-pink-600',
  },
  {
    value: 'game',
    label: 'Game',
    icon: Gamepad2,
    description: '2D game, puzzle, arcade',
    color: 'from-orange-600 to-red-600',
  },
  {
    value: 'api',
    label: 'API/Backend',
    icon: Server,
    description: 'REST API, backend service',
    color: 'from-yellow-600 to-orange-600',
  },
  {
    value: 'other',
    label: 'Other',
    icon: Package,
    description: 'Custom project type',
    color: 'from-gray-600 to-gray-700',
  },
];

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('web');
  const [framework, setFramework] = useState('');
  
  const createProject = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }
    
    if (name.trim().length < 3) {
      toast.error('Project name must be at least 3 characters');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Project description is required');
      return;
    }
    
    if (description.trim().length < 10) {
      toast.error('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    try {
      const result = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        type,
        framework: framework.trim() || undefined,
      });

      toast.success('Project created! Generating plan...');
      
      // Navigate to project workspace
      router.push(`/dashboard/vibe/projects/${result.project._id.toString()}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/100 characters
            </p>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What do you want to build? *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project idea. For example: 'A portfolio website to showcase my design work with a gallery, about page, and contact form'"
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters - Be specific for better results
            </p>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Project Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {projectTypes.map((pt) => {
                const Icon = pt.icon;
                const isSelected = type === pt.value && (
                  (pt.label === 'Website' && !framework) ||
                  (pt.label === 'Web App' && framework) ||
                  pt.label !== 'Website' && pt.label !== 'Web App'
                );
                
                return (
                  <button
                    key={pt.label}
                    type="button"
                    onClick={() => {
                      setType(pt.value);
                      if (pt.label === 'Web App') setFramework('react');
                      else if (pt.label === 'Website') setFramework('');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pt.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-semibold text-white mb-1">{pt.label}</div>
                    <div className="text-xs text-gray-400">{pt.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Framework (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Framework (Optional)
            </label>
            <input
              type="text"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              placeholder="e.g., React, Next.js, Vue, Express"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to let AI choose the best framework
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-white transition-colors"
              disabled={createProject.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
