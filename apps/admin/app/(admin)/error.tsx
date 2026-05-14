'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import Forbidden from '@/components/common/Forbidden';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Area Error:', error);
  }, [error]);

  // Handle Forbidden error specifically if possible
  // Note: Next.js digests might not make it easy to see the status code here
  // unless we throw a specific error message or object
  if (error.message.includes('403') || error.message.toLowerCase().includes('forbidden')) {
    return <Forbidden />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <AlertCircle className="h-16 w-16 text-destructive" />
      </div>
      
      <h1 className="text-2xl font-bold tracking-tight mb-2">Đã xảy ra lỗi!</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại hoặc liên hệ kỹ thuật nếu vấn đề tiếp diễn.
      </p>
      
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Thử lại
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-muted rounded-lg text-left overflow-auto max-w-2xl w-full">
          <p className="font-mono text-sm text-destructive">{error.message}</p>
          <pre className="mt-2 text-xs opacity-50">{error.stack}</pre>
        </div>
      )}
    </div>
  );
}
