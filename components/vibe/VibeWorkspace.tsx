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
import BuildProgressModal from './BuildProgressModal';
import { ArrowLeft, Play, Shield, Package, Settings, Loader2, Terminal, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface VibeWorkspaceProps {
  project: VibeProject;
}

export default function VibeWorkspace({ project }: VibeWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [bottomPanel, setBottomPanel] = useState<'security' | 'terminal' | null>(null);
  const [buildSessionId, setBuildSessionId] = useState<string | null>(null);
  const [showBuildProgress, setShowBuildProgress] = useState(false);
  
  const { data: fileTreeData } = useVibeFileTree(project._id.toString());
  const { data: chatData } = useVibeChat(project._id.toString());
  const generatePlan = useGeneratePlan(project._id.toString());

  const fileTree = fileTreeData?.tree;
  const messages = chatData?.messages || [];

  // Auto-generate plan if in planning status and no plan exists
  // DISABLED: Let user trigger build manually with "Build with AI Team" button
  // useEffect(() => {
  //   if (project.status === 'planning' && !project.plan && !generatePlan.isPending) {
  //     handleGeneratePlan();
  //   }
  // }, [project.status, project.plan]);

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

  const handleStartBuild = async () => {
    try {
      toast.info('🤖 Starting AI Build Team...');
      
      const response = await fetch('/api/vibe/builds/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project._id.toString(),
          buildConfig: {
            autoApprove: false, // Changed to false - we now require manual approval
            generateTests: false,
            runSecurityScan: true,
            buildMode: 'standard',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start build');
      }

      const data = await response.json();
      toast.success('Generating plan...');
      
      // Redirect to plan page to review and approve
      setTimeout(() => {
        window.location.href = `/dashboard/vibe/projects/${project._id.toString()}/plan`;
      }, 1000);
    } catch (error) {
      console.error('Failed to start build:', error);
      toast.error('Failed to start AI Build Team. Please try again.');
    }
  };

  const handleBuildComplete = () => {
    setShowBuildProgress(false);
    setBuildSessionId(null);
    toast.success('🎉 Build complete! Your app is ready.');
    // Refresh the page to show new files
    window.location.reload();
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
          {/* Build with AI Team Button */}
          <button
            onClick={handleStartBuild}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 text-white transition-all shadow-lg shadow-purple-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Build with AI Team
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

      {/* Empty State - No Plan */}
      {!project.plan && !showBuildProgress && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl px-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Build Your App?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Click "Build with AI Team" to have our AI agents create your project plan, 
              design the architecture, and generate working code automatically.
            </p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-left mb-8">
              <h3 className="text-white font-semibold mb-3">What happens when you build:</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400">1.</span>
                  <span>Planner Agent creates a detailed project plan</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400">2.</span>
                  <span>Requirements Agent defines technical specifications</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400">3.</span>
                  <span>Architecture Agent designs the system structure</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400">4.</span>
                  <span>UI/UX Agent creates the design system</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400">5.</span>
                  <span>Code Agent generates working React components</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400">6.</span>
                  <span>Review Agent checks for security issues</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleStartBuild}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-lg font-semibold flex items-center gap-3 text-white transition-all shadow-xl shadow-purple-500/30 mx-auto"
            >
              <Sparkles className="w-6 h-6" />
              Build with AI Team
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Takes ~60-90 seconds • Free tier
            </p>
          </div>
        </div>
      )}

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
      {!showPlan && project.plan && (
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

      {/* Build Progress Modal */}
      {showBuildProgress && buildSessionId && (
        <BuildProgressModal
          sessionId={buildSessionId}
          projectId={project._id.toString()}
          onClose={() => setShowBuildProgress(false)}
          onComplete={handleBuildComplete}
        />
      )}
    </div>
  );
}
