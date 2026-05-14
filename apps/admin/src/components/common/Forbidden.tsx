'use client';

import React from 'react';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Forbidden() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <ShieldAlert className="h-16 w-16 text-destructive" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-2">Truy cập bị từ chối</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là một lỗi.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
