'use client';

import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';

export default function Forbidden() {
  const { clearAuth, accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleBackToLogin = async () => {
    setIsLoading(true);
    try {
      await authApi.logout(accessToken || undefined);
    } catch (error) {
      console.error('[Forbidden] Lỗi đăng xuất:', error);
    } finally {
      clearAuth();
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <ShieldAlert className="h-16 w-16 text-destructive" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-2">Truy cập bị từ chối</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là một lỗi.
      </p>
      
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={handleBackToLogin}
          disabled={isLoading}
          className="flex items-center gap-2 font-bold px-6 py-2.5 shadow-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          <span>Quay lại trang đăng nhập</span>
        </Button>
      </div>
    </div>
  );
}


