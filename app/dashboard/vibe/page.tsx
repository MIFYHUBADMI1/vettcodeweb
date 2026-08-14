/**
 * Vibe Coder Dashboard - Project List
 * Main entry point for VettCode Vibe Coder
 */

'use client';

import { useState } from 'react';
import { useVibeProjects } from '@/lib/hooks/useVibeProjects';
import VibeProjectList from '@/components/vibe/VibeProjectList';
import CreateProjectModal from '@/components/vibe/CreateProjectModal';
import { Code2, Sparkles, Loader2 } from 'lucide-react';

export default function VibeCoderDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, isLoading, error } = useVibeProjects();

  const projects = data?.projects || [];
  const activeProjects = projects.filter(p => p.status === 'active');
  const planningProjects = projects.filter(p => p.status === 'planning');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-green-600 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">
                  VettCode <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">Vibe Coder</span>
                </h1>
              </div>
              <p className="text-gray-400 ml-13">
                AI-powered development workspace - Turn your ideas into working applications
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-1">{projects.length}</div>
              <div className="text-sm text-gray-400">Total Projects</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-1">{activeProjects.length}</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-1">{planningProjects.length}</div>
              <div className="text-sm text-gray-400">Planning</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading your projects...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">Failed to load projects</p>
            <p className="text-sm text-gray-400 mt-2">{error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/20 to-green-600/20 flex items-center justify-center mx-auto mb-6">
              <Code2 className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome to Vibe Coder
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start your first AI-powered project. Just describe what you want to build and let VettCode help you create it.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Create Your First Project
            </button>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left">
                <div className="text-2xl mb-2">🌐</div>
                <h3 className="font-semibold text-white mb-2">Websites</h3>
                <p className="text-sm text-gray-400">Portfolio sites, landing pages, blogs</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold text-white mb-2">Web Apps</h3>
                <p className="text-sm text-gray-400">Interactive applications, dashboards</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left">
                <div className="text-2xl mb-2">🎮</div>
                <h3 className="font-semibold text-white mb-2">Games</h3>
                <p className="text-sm text-gray-400">2D games, puzzles, interactive experiences</p>
              </div>
            </div>
          </div>
        )}

        {/* Project List */}
        {!isLoading && !error && projects.length > 0 && (
          <VibeProjectList projects={projects} />
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
