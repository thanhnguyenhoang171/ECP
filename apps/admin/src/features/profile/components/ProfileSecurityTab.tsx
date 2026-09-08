'use client';

import React from 'react';
import { KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ProfileSecurityTab = (): React.JSX.Element => {
  return (
    <Card className="border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl">
      <CardHeader className="border-b border-slate-200/80 bg-slate-200/50">
        <CardTitle className="text-slate-900 text-lg font-bold">Đổi mật khẩu tài khoản</CardTitle>
        <CardDescription className="text-slate-500 text-xs">
          Khuyến nghị đặt mật khẩu mạnh có tối thiểu 8 ký tự bao gồm chữ cái, số và ký tự đặc biệt.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
              Mật khẩu hiện tại
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              className="h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
              Mật khẩu mới
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              className="h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
              Xác nhận mật khẩu mới
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              className="h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button
            variant="secondary"
            className="gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl px-6 h-11 text-xs uppercase tracking-wider cursor-pointer"
          >
            <KeyRound size={16} /> Cập nhật mật khẩu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
