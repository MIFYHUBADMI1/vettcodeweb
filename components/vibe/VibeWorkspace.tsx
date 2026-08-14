/**
 * Vibe Workspace - Main Development Environment
 * 3-panel layout: Files | Editor/Preview | AI Chat
 */

'use client';

import { useState, useEffect } from 'react';
import { VibeProject } from '@/lib/models/VibeProject';
import { useVibeFileTree, useVibeChat, useGeneratePlan } from '@/lib/hooks/useVibeProjects';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import PreviewPanel from './PreviewPanel';
import AIChat from './AIChat';
import ProjectPlanDisplay from './ProjectPlanDisplay';
import SecurityPanel from './SecurityPanel';
import { ArrowLeft, Play, Shield, Package, Settings, Loader2, Terminal } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface VibeWorkspaceProps {
  project: VibeProject;
}

export default function VibeWorkspace({ project }: VibeWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showPlan, setShowPlan] = useState(!project.plan && project.status === 'planning');
  const [bottomPanel, setBottomPanel] = useState<'security' | 'terminal' | null>(null);
  
  const { data: fileTreeData } = useVibeFileTree(project._id.toString());
  const { data: chatData } = useVibeChat(project._id.toString());
  const generatePlan = useGeneratePlan(project._id.toString());

  const fileTree = fileTreeData?.tree;
  const messages = chatData?.messages || [];

  // Auto-generate plan if in planning status and no plan exists
  useEffect(() => {
    if (project.status === 'planning' && !project.plan && !generatePlan.isPending) {
      handleGeneratePlan();
    }
  }, [project.status, project.plan]);

  const handleGeneratePlan = async () => {
    try {
      toast.info('Generating project plan with AI...');
      await generatePlan.mutateAsync({
        description: project.description,
        type: project.type,
      });
      toast.success('Project plan generated!');
      setShowPlan(false);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast.error('Failed to generate plan. You can try chatting with AI to create one.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top Bar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/vibe"
            className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          
          <div>
            <h1 className="font-semibold text-white">{project.name}</h1>
            <p className="text-xs text-gray-500">{project.type} {project.framework && `• ${project.framework}`}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Button (Coming Soon) */}
          <button
            disabled
            className="px-3 py-1.5 bg-gray-800 text-gray-500 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed"
            title="Preview coming soon"
          >
            <Play className="w-4 h-4" />
            Preview
          </button>

          {/* Security Scan Button */}
          <button
            onClick={() => setBottomPanel(bottomPanel === 'security' ? null : 'security')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              bottomPanel === 'security'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="Security scan"
          >
            <Shield className="w-4 h-4" />
            Security
          </button>

          {/* Package Button */}
          <button
            disabled
            className="px-3 py-1.5 bg-gray-800 text-gray-500 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed"
            title="Package coming soon"
          >
            <Package className="w-4 h-4" />
            Package
          </button>

          {/* Settings */}
          <button
            className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
            title="Project settings"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Plan Display (if showing) */}
      {showPlan && project.plan && (
        <div className="flex-1 overflow-hidden">
          <ProjectPlanDisplay 
            project={project} 
            onClose={() => setShowPlan(false)} 
          />
        </div>
      )}

      {/* Plan Generation Loading */}
      {showPlan && !project.plan && generatePlan.isPending && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Creating Your Project Plan
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              AI is analyzing your project idea and creating a structured plan with features, pages, and security considerations...
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace (3 panels with optional bottom panel) */}
      {!showPlan && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Section - 3 panels */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - File Explorer */}
            <div className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
              <FileExplorer
                projectId={project._id.toString()}
                tree={fileTree}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
              />
            </div>

            {/* Center Panel - Code Editor OR Preview */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedFile ? (
                <CodeEditor
                  projectId={project._id.toString()}
                  selectedFile={selectedFile}
                />
              ) : (
                <PreviewPanel
                  projectId={project._id.toString()}
                  project={project}
                />
              )}
            </div>

            {/* Right Panel - AI Chat */}
            <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
              <AIChat
                projectId={project._id.toString()}
                project={project}
                messages={messages}
              />
            </div>
          </div>

          {/* Bottom Panel - Security / Terminal */}
          {bottomPanel && (
            <div className="h-96 border-t border-gray-800 bg-gray-950">
              {bottomPanel === 'security' && (
                <SecurityPanel projectId={project._id.toString()} />
              )}
              {bottomPanel === 'terminal' && (
                <div className="p-4 text-gray-400">Terminal coming soon...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
