'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { BackgroundProvider } from './BackgroundProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundProvider>
        <TooltipProvider delayDuration={0}>
          {children}
          <Toaster position='top-center' richColors />
        </TooltipProvider>
      </BackgroundProvider>
    </QueryClientProvider>
  );
}
