'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__?: QueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: (failureCount, error: unknown): boolean => {
              // Do not retry client-side errors (4xx: 400, 401, 403, 404)
              const status = (error as { status?: number })?.status;
              const message = (error as Error)?.message || '';
              if (
                (status && status >= 400 && status < 500) ||
                message.includes('403') ||
                message.toLowerCase().includes('forbidden') ||
                message.includes('401') ||
                message.includes('404')
              ) {
                return false;
              }
              // Retry at most 1 time for network / temporary 5xx errors
              return failureCount < 1;
            },
          },
        },
      }),
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__TANSTACK_QUERY_CLIENT__ = queryClient;
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        {children}
        <Toaster 
          position={typeof window !== 'undefined' && window.innerWidth < 640 ? 'bottom-center' : 'top-center'} 
          richColors 
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
