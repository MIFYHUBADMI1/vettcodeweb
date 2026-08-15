/**
 * VettCode Query Configuration
 * Centralized configuration for React Query / Server State Management
 */

// Cache/Stale Time Configuration
export const FIVE_MINUTES = 5 * 60 * 1000 // 5 minutes in milliseconds
export const ONE_MINUTE = 60 * 1000

// Query Configuration
export const queryConfig = {
  // Default stale time - data is considered fresh for this duration
  defaultStaleTime: FIVE_MINUTES,
  
  // Default cache time - unused data is garbage collected after this duration
  defaultCacheTime: 10 * 60 * 1000, // 10 minutes
  
  // Retry configuration
  defaultRetry: 1,
  defaultRetryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  
  // Refetch configuration
  refetchOnWindowFocus: false, // Don't refetch on every window focus
  refetchOnReconnect: true,    // Refetch when network reconnects
  refetchOnMount: true,         // Check staleness on mount
}

// Query Keys - Centralized to avoid duplication and typos
export const queryKeys = {
  // Profile / Account
  profile: (userId?: string) => ['profile', userId] as const,
  devices: (userId?: string) => ['devices', userId] as const,
  
  // Scans
  scans: (userId?: string) => ['scans', userId] as const,
  scan: (userId: string | undefined, scanId: string) => ['scan', userId, scanId] as const,
  
  // Dashboard
  dashboard: (userId?: string) => ['dashboard', userId] as const,
  stats: (userId?: string) => ['stats', userId] as const,
  
  // Vibe Coder
  vibeProjects: (userId?: string) => ['vibe', 'projects', userId] as const,
  vibeProject: (userId: string | undefined, projectId: string) => ['vibe', 'project', userId, projectId] as const,
  vibeProjectFiles: (userId: string | undefined, projectId: string) => ['vibe', 'files', userId, projectId] as const,
  vibeFileTree: (userId: string | undefined, projectId: string) => ['vibe', 'fileTree', userId, projectId] as const,
  vibeChat: (userId: string | undefined, projectId: string) => ['vibe', 'chat', userId, projectId] as const,
  vibeStats: (userId?: string) => ['vibe', 'stats', userId] as const,
  
  // Vibe Build Sessions
  buildSession: (userId: string | undefined, sessionId: string) => ['vibe', 'build', 'session', userId, sessionId] as const,
  buildTasks: (userId: string | undefined, sessionId: string) => ['vibe', 'build', 'tasks', userId, sessionId] as const,
  buildActivities: (userId: string | undefined, sessionId: string, limit?: number) => ['vibe', 'build', 'activities', userId, sessionId, limit] as const,
  projectBuildSessions: (userId: string | undefined, projectId: string) => ['vibe', 'build', 'sessions', userId, projectId] as const,
  activeBuildSession: (userId: string | undefined, projectId: string) => ['vibe', 'build', 'active', userId, projectId] as const,
}
