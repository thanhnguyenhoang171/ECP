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
