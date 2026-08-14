/**
 * React Query hooks for Vibe Coder Projects
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { queryKeys } from '../query-config';
import type { VibeProject, ProjectType, ProjectPlan } from '../models/VibeProject';
import type { VibeProjectFile, FileTreeNode } from '../models/VibeProjectFile';
import type { VibeMessage } from '../models/VibeConversation';

// ============================================================================
// Fetch Functions
// ============================================================================

async function fetchVibeProjects(): Promise<{ projects: VibeProject[] }> {
  const response = await fetch('/api/vibe/projects');
  if (!response.ok) {
    throw new Error('Failed to load projects');
  }
  return response.json();
}

async function fetchVibeProject(projectId: string): Promise<{ project: VibeProject }> {
  const response = await fetch(`/api/vibe/projects/${projectId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Project not found');
    }
    throw new Error('Failed to load project');
  }
  return response.json();
}

async function fetchVibeProjectFiles(projectId: string): Promise<{ files: VibeProjectFile[] }> {
  const response = await fetch(`/api/vibe/projects/${projectId}/files`);
  if (!response.ok) {
    throw new Error('Failed to load files');
  }
  return response.json();
}

async function fetchVibeFileTree(projectId: string): Promise<{ tree: FileTreeNode }> {
  const response = await fetch(`/api/vibe/projects/${projectId}/files/tree`);
  if (!response.ok) {
    throw new Error('Failed to load file tree');
  }
  return response.json();
}

async function fetchVibeChatHistory(projectId: string): Promise<{ messages: VibeMessage[] }> {
  const response = await fetch(`/api/vibe/projects/${projectId}/chat`);
  if (!response.ok) {
    throw new Error('Failed to load chat history');
  }
  return response.json();
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all projects for current user
 */
export function useVibeProjects() {
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useQuery({
    queryKey: queryKeys.vibeProjects(userId),
    queryFn: fetchVibeProjects,
    enabled: !!session?.user,
  });
}

/**
 * Get single project
 */
export function useVibeProject(projectId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useQuery({
    queryKey: queryKeys.vibeProject(userId, projectId),
    queryFn: () => fetchVibeProject(projectId),
    enabled: !!session?.user && !!projectId,
  });
}

/**
 * Get project files
 */
export function useVibeProjectFiles(projectId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useQuery({
    queryKey: queryKeys.vibeProjectFiles(userId, projectId),
    queryFn: () => fetchVibeProjectFiles(projectId),
    enabled: !!session?.user && !!projectId,
  });
}

/**
 * Get project file tree
 */
export function useVibeFileTree(projectId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useQuery({
    queryKey: queryKeys.vibeFileTree(userId, projectId),
    queryFn: () => fetchVibeFileTree(projectId),
    enabled: !!session?.user && !!projectId,
  });
}

/**
 * Get chat history
 */
export function useVibeChat(projectId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useQuery({
    queryKey: queryKeys.vibeChat(userId, projectId),
    queryFn: () => fetchVibeChatHistory(projectId),
    enabled: !!session?.user && !!projectId,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      type: ProjectType;
      framework?: string;
    }) => {
      const response = await fetch('/api/vibe/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProjects(userId) });
    },
  });
}

/**
 * Update project
 */
export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useMutation({
    mutationFn: async (data: {
      name?: string;
      description?: string;
      framework?: string;
      plan?: ProjectPlan;
    }) => {
      const response = await fetch(`/api/vibe/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProject(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProjects(userId) });
    },
  });
}

/**
 * Archive project
 */
export function useArchiveProject() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/vibe/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to archive project');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProjects(userId) });
    },
  });
}

/**
 * Send chat message
 */
export function useSendVibeMessage(projectId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(`/api/vibe/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate chat and potentially files if AI made changes
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeChat(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProjectFiles(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeFileTree(userId, projectId) });
    },
  });
}

/**
 * Create file
 */
export function useCreateFile(projectId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useMutation({
    mutationFn: async (data: { path: string; content: string }) => {
      const response = await fetch(`/api/vibe/projects/${projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create file');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProjectFiles(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeFileTree(userId, projectId) });
    },
  });
}

/**
 * Update file
 */
export function useUpdateFile(projectId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useMutation({
    mutationFn: async (data: { path: string; content: string }) => {
      const response = await fetch(`/api/vibe/projects/${projectId}/files/${encodeURIComponent(data.path)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update file');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProjectFiles(userId, projectId) });
    },
  });
}

/**
 * Delete file
 */
export function useDeleteFile(projectId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useMutation({
    mutationFn: async (path: string) => {
      const response = await fetch(`/api/vibe/projects/${projectId}/files/${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProjectFiles(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeFileTree(userId, projectId) });
    },
  });
}

/**
 * Generate project plan
 */
export function useGeneratePlan(projectId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;
  
  return useMutation({
    mutationFn: async (data: { description: string; type: ProjectType }) => {
      const response = await fetch(`/api/vibe/projects/${projectId}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate plan');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProject(userId, projectId) });
    },
  });
}
