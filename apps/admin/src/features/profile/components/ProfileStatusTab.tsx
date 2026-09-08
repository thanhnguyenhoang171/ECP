'use client';

import React from 'react';
import { ShieldCheck, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export interface ProfileStatusTabProps {
  readonly isDataLoading: boolean;
  readonly isEmailVerified: boolean;
  readonly isPhoneVerified: boolean;
}

export const ProfileStatusTab = ({
  isDataLoading,
  isEmailVerified,
  isPhoneVerified,
}: ProfileStatusTabProps): React.JSX.Element => {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card className="border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl">
        <CardHeader className="border-b border-slate-200/80 bg-slate-200/50">
          <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600" />
            Xác thực Email
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Trạng thái Email:</span>
            {isDataLoading ? (
              <Skeleton className="h-5 w-24 rounded-full" />
            ) : isEmailVerified ? (
              <Badge className="bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                ✓ Đã xác thực
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                ! Chưa xác thực
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Email chính thức dùng để nhận thông báo khẩn cấp và mã xác thực hệ thống.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl">
        <CardHeader className="border-b border-slate-200/80 bg-slate-200/50">
          <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
            <Phone size={18} className="text-blue-600" />
            Xác thực Số điện thoại
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Trạng thái SĐT:</span>
            {isDataLoading ? (
              <Skeleton className="h-5 w-24 rounded-full" />
            ) : isPhoneVerified ? (
              <Badge className="bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                ✓ Đã xác thực
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                Chưa xác thực
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bảo vệ tài khoản với tính năng xác thực 2 lớp qua SMS khi cần thiết.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
