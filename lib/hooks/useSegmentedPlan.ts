/**
 * React Query hooks for Segmented Planning
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export interface SegmentedPlanResponse {
  success: boolean;
  plan: {
    status: string;
    completedSections: string[];
    currentSection?: string;
    sectionsData: Record<string, any>;
    conflictWarnings?: Array<{
      section: string;
      message: string;
      affectedSections: string[];
    }>;
  };
  progress: {
    progress: number;
    status: string;
    completedSections: string[];
  };
}

/**
 * Fetch segmented plan with auto-refresh
 */
export function useSegmentedPlan(projectId: string) {
  return useQuery({
    queryKey: ['segmentedPlan', projectId],
    queryFn: async (): Promise<SegmentedPlanResponse> => {
      const response = await fetch(`/api/vibe/projects/${projectId}/plan/segmented`);
      
      // Handle 404 - no plan exists yet
      if (response.status === 404) {
        return {
          success: false,
          plan: {
            status: 'initializing',
            completedSections: [],
            sectionsData: {},
          },
          progress: {
            progress: 0,
            status: 'not_started',
            completedSections: [],
          },
        };
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch plan');
      }
      return response.json();
    },
    refetchInterval: (data) => {
      // Auto-refresh every 5 seconds if generating
      return data?.plan?.status === 'generating' ? 5000 : false;
    },
    staleTime: 2000,
    retry: false, // Don't retry on 404
  });
}

/**
 * Start segmented planning
 */
export function useStartSegmentedPlan(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/vibe/projects/${projectId}/plan/segmented`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start planning');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segmentedPlan', projectId] });
      toast.success('Planning started!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Edit a section
 */
export function useEditSection(projectId: string, sectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sectionData: any) => {
      const response = await fetch(
        `/api/vibe/projects/${projectId}/plan/segmented/sections/${sectionId}/edit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionData }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to save section');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segmentedPlan', projectId] });
      toast.success('Section updated!');
    },
    onError: () => {
      toast.error('Failed to save section');
    },
  });
}

/**
 * Regenerate a section
 */
export function useRegenerateSection(projectId: string, sectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/vibe/projects/${projectId}/plan/segmented/sections/${sectionId}/regenerate`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to regenerate section');
      }
      return response.json();
    },
    onMutate: () => {
      toast.info('Regenerating section...');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segmentedPlan', projectId] });
      toast.success('Section regenerated!');
    },
    onError: () => {
      toast.error('Failed to regenerate section');
    },
  });
}

/**
 * Pause planning
 */
export function usePausePlanning(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/vibe/projects/${projectId}/plan/segmented/pause`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to pause');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segmentedPlan', projectId] });
      toast.success('Planning paused');
    },
    onError: () => {
      toast.error('Failed to pause planning');
    },
  });
}

/**
 * Resume planning
 */
export function useResumePlanning(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/vibe/projects/${projectId}/plan/segmented/resume`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to resume');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segmentedPlan', projectId] });
      toast.success('Planning resumed!');
    },
    onError: () => {
      toast.error('Failed to resume planning');
    },
  });
}

/**
 * Approve plan
 */
export function useApprovePlan(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/vibe/projects/${projectId}/plan/segmented/approve`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to approve plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segmentedPlan', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activeBuildSession', projectId] });
      toast.success('Plan approved! Starting build...');
    },
    onError: () => {
      toast.error('Failed to approve plan');
    },
  });
}

/**
 * Reset plan (delete and restart)
 */
export function useResetPlan(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/vibe/projects/${projectId}/builds/reset`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reset plan');
      }
      return response.json();
    },
    onSuccess: () => {
      // Set the plan to initializing state immediately
      queryClient.setQueryData(['segmentedPlan', projectId], {
        success: false,
        plan: {
          status: 'initializing',
          completedSections: [],
          sectionsData: {},
        },
        progress: {
          progress: 0,
          status: 'not_started',
          completedSections: [],
        },
      });
      
      // Then invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['segmentedPlan', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activeBuildSession', projectId] });
      toast.success('Plan reset successfully! You can now start a new plan.');
    },
    onError: () => {
      toast.error('Failed to reset plan');
    },
  });
}

/**
 * Manual refresh plan
 */
export function useRefreshPlan(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['segmentedPlan', projectId] });
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Plan refreshed!');
    },
  });
}
