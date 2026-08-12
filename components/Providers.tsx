'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useState } from 'react'
import { queryConfig } from '@/lib/query-config'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance - one per app lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: queryConfig.defaultStaleTime,
            gcTime: queryConfig.defaultCacheTime,
            retry: queryConfig.defaultRetry,
            retryDelay: queryConfig.defaultRetryDelay,
            refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
            refetchOnReconnect: queryConfig.refetchOnReconnect,
            refetchOnMount: queryConfig.refetchOnMount,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {children}
      </SessionProvider>
      {/* React Query DevTools - only visible in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
