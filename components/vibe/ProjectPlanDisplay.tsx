/**
 * Project Plan Display Component
 * Shows AI-generated project plan
 */

'use client';

import { VibeProject } from '@/lib/models/VibeProject';
import { useUpdateProject } from '@/lib/hooks/useVibeProjects';
import { X, Check, AlertCircle, Target, Layers, Database, Lock, Rocket, Edit } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface ProjectPlanDisplayProps {
  project: VibeProject;
  onClose: () => void;
}

export default function ProjectPlanDisplay({ project, onClose }: ProjectPlanDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateProject = useUpdateProject(project._id.toString());

  if (!project.plan) {
    return null;
  }

  const handleStartBuilding = async () => {
    try {
      await updateProject.mutateAsync({ status: 'active' });
      toast.success('Project activated! Start building.');
      onClose();
    } catch (error) {
      toast.error('Failed to activate project');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Project Plan</h1>
            <p className="text-gray-400">AI-generated plan for {project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Goal */}
        <div className="bg-gradient-to-br from-purple-900/30 to-green-900/30 border border-purple-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-green-600 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-2">Project Goal</h2>
              <p className="text-gray-300">{project.plan.goal}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Core Features</h2>
          </div>
          <ul className="space-y-2">
            {project.plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pages/Screens */}
        {project.plan.pages.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Pages & Screens</h2>
            </div>
            <ul className="space-y-2">
              {project.plan.pages.map((page, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
                  <span className="text-gray-300">{page}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Data Requirements */}
        {project.plan.dataRequirements.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Data Requirements</h2>
            </div>
            <ul className="space-y-2">
              {project.plan.dataRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 mt-2" />
                  <span className="text-gray-300">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Authentication */}
        {project.plan.authentication && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-400">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Authentication Required</span>
            </div>
          </div>
        )}

        {/* External Services */}
        {project.plan.externalServices.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">External Services</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.plan.externalServices.map((service, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Security Considerations */}
        {project.plan.securityConsiderations.length > 0 && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-white">Security Considerations</h2>
            </div>
            <ul className="space-y-2">
              {project.plan.securityConsiderations.map((consideration, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{consideration}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Deployment Target */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Deployment Target</h2>
          </div>
          <p className="text-gray-300">{project.plan.deploymentTarget}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleStartBuilding}
            disabled={updateProject.isPending}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-700 rounded-lg font-semibold text-white transition-all transform hover:scale-105 disabled:transform-none shadow-lg"
          >
            Start Building
          </button>
          
          <button
            onClick={() => setIsEditing(true)}
            disabled
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg font-medium text-gray-400 transition-colors flex items-center gap-2"
            title="Edit plan (coming soon)"
          >
            <Edit className="w-5 h-5" />
            Edit Plan
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Once you start building, you can chat with AI to generate code and files
        </p>
      </div>
    </div>
  );
}
