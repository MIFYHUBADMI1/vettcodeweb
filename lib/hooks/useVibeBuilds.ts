/**
 * React Query hooks for Vibe Coder Build Sessions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { queryKeys } from '../query-config';
import type { BuildSession } from '../models/BuildSession';
import type { BuildTask } from '../models/BuildTask';
import type { BuildActivity } from '../models/BuildActivity';

// ============================================================================
// Fetch Functions
// ============================================================================

async function fetchBuildSession(sessionId: string): Promise<{ session: BuildSession }> {
  const response = await fetch(`/api/vibe/builds/${sessionId}/status`);
  if (!response.ok) {
    throw new Error('Failed to load build session');
  }
  return response.json();
}

async function fetchBuildActivities(sessionId: string, limit?: number): Promise<{ activities: BuildActivity[] }> {
  const url = `/api/vibe/builds/${sessionId}/activities${limit ? `?limit=${limit}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load build activities');
  }
  return response.json();
}

async function fetchProjectBuildSessions(projectId: string): Promise<{ sessions: BuildSession[] }> {
  const response = await fetch(`/api/vibe/projects/${projectId}/builds`);
  if (!response.ok) {
    // If endpoint doesn't exist yet, return empty array
    if (response.status === 404) {
      return { sessions: [] };
    }
    throw new Error('Failed to load build sessions');
  }
  return response.json();
}

async function fetchActiveBuildSession(projectId: string): Promise<{ session: BuildSession | null }> {
  const response = await fetch(`/api/vibe/projects/${projectId}/builds/active`);
  if (!response.ok) {
    // If endpoint doesn't exist or no active session, return null
    if (response.status === 404) {
      return { session: null };
    }
    throw new Error('Failed to load active build session');
  }
  return response.json();
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get build session by ID
 */
export function useBuildSession(sessionId: string | null) {
  const { data: session } = useSession();
  const userId = session?.user?.email;

  return useQuery({
    queryKey: queryKeys.buildSession(userId, sessionId || ''),
    queryFn: () => fetchBuildSession(sessionId!),
    enabled: !!session?.user && !!sessionId,
    staleTime: 0,
    refetchInterval: (data) => {
      // If build is active, poll every 2 seconds
      const isActive = data?.session?.status &&
        ['queued', 'planning', 'building', 'reviewing', 'testing'].includes(data.session.status);
      return isActive ? 2000 : false;
    },
  });
}

/**
 * Get build activities for a session
 */
export function useBuildActivities(sessionId: string | null, limit?: number) {
  const { data: session } = useSession();
  const userId = session?.user?.email;

  return useQuery({
    queryKey: queryKeys.buildActivities(userId, sessionId || '', limit),
    queryFn: () => fetchBuildActivities(sessionId!, limit),
    enabled: !!session?.user && !!sessionId,
    refetchInterval: (data) => {
      // If build is active, poll every 1 second for activities
      // Otherwise don't poll
      return data?.activities?.[0] ? 1000 : false;
    },
  });
}

/**
 * Get all build sessions for a project
 */
export function useProjectBuildSessions(projectId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.email;

  return useQuery({
    queryKey: queryKeys.projectBuildSessions(userId, projectId),
    queryFn: () => fetchProjectBuildSessions(projectId),
    enabled: !!session?.user && !!projectId,
  });
}

/**
 * Get active build session for a project
 */
export function useActiveBuildSession(projectId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.email;

  return useQuery({
    queryKey: queryKeys.activeBuildSession(userId, projectId),
    queryFn: () => fetchActiveBuildSession(projectId),
    enabled: !!session?.user && !!projectId,
    staleTime: 0,
    refetchInterval: (data) => {
      // If build is active, poll every 2 seconds
      const isActive = data?.session?.status &&
        ['queued', 'planning', 'building', 'reviewing', 'testing'].includes(data.session.status);
      return isActive ? 2000 : false;
    },
  });
}

/**
 * Get build tasks for a session
 */
export function useBuildTasks(sessionId: string | null) {
  const { data: session } = useSession();
  const userId = session?.user?.email;

  return useQuery({
    queryKey: queryKeys.buildTasks(userId, sessionId || ''),
    queryFn: async () => {
      const response = await fetch(`/api/vibe/builds/${sessionId}/tasks`);
      if (!response.ok) {
        // If endpoint doesn't exist, try to get from session status response
        const sessionResponse = await fetch(`/api/vibe/builds/${sessionId}/status`);
        if (sessionResponse.ok) {
          const data = await sessionResponse.json();
          return { tasks: data.tasks || [] };
        }
        throw new Error('Failed to load build tasks');
      }
      return response.json();
    },
    enabled: !!session?.user && !!sessionId,
    refetchInterval: 2000, // Poll every 2 seconds during build
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Start a new build
 */
export function useStartBuild(projectId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.email;

  return useMutation({
    mutationFn: async (config?: {
      autoApprove?: boolean;
      generateTests?: boolean;
      runSecurityScan?: boolean;
      buildMode?: 'fast' | 'standard' | 'thorough';
    }) => {
      const response = await fetch('/api/vibe/builds/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          buildConfig: {
            autoApprove: config?.autoApprove ?? true,
            generateTests: config?.generateTests ?? false,
            runSecurityScan: config?.runSecurityScan ?? true,
            buildMode: config?.buildMode || 'standard',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start build');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.activeBuildSession(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectBuildSessions(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vibeProject(userId, projectId) });
    },
  });
}

/**
 * Retry failed build
 */
export function useRetryBuild(projectId: string) {
  return useStartBuild(projectId);
}
