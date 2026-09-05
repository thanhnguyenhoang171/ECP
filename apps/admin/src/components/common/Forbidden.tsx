'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ForbiddenProps {
  readonly title?: string;
  readonly description?: string;
}

export default function Forbidden({
  title = 'Truy cập bị từ chối',
  description = 'Bạn không có quyền truy cập vào trang này hoặc thực hiện tác vụ này. Vui lòng liên hệ với Quản trị viên để được cấp quyền.',
}: ForbiddenProps): React.JSX.Element {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl mb-6 shadow-2xs">
        <ShieldAlert className="h-16 w-16 text-rose-500" />
      </div>
      
      <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-500 text-sm mb-8 max-w-md leading-relaxed">
        {description}
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2 font-bold text-xs h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại trang trước</span>
        </Button>

        <Button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 font-bold text-xs h-10 px-5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer shadow-2xs"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Về Bảng điều khiển</span>
        </Button>
      </div>
    </div>
  );
}



