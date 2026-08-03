'use client';

import React from 'react';
import { Award, Mail } from 'lucide-react';
import { AuthUser } from '@/types/user';
import { formatRoleLabel } from '@/utils/formatters';

interface ProfileHeaderBannerProps {
  user: AuthUser | null;
  isDataLoading: boolean;
}

export default function ProfileHeaderBanner({ user, isDataLoading }: ProfileHeaderBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#FFFBEB] via-[#FFF8E1] to-[#FEF3C7] rounded-2xl p-6 sm:p-8 text-zinc-900 border border-amber-200/90 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {isDataLoading ? (
            <div className="w-16 h-16 rounded-full bg-amber-200/80 animate-pulse border border-amber-300 shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#F5C542] border border-amber-300 flex items-center justify-center text-[#1E1B18] font-bold text-xl shadow-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isDataLoading ? (
                <div className="h-6 w-36 bg-amber-200/90 rounded animate-pulse" />
              ) : (
                <h1 className="text-xl font-bold text-zinc-900">{user?.username}</h1>
              )}

              {isDataLoading ? (
                <div className="h-5 w-24 bg-amber-200/70 rounded-full animate-pulse" />
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300/80 text-[11px] font-bold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-800" />
                  {formatRoleLabel(user?.roles?.[0])}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-700 mt-1 flex items-center justify-center sm:justify-start gap-3 font-medium">
              {isDataLoading ? (
                <span className="h-3.5 w-48 bg-amber-200/70 rounded animate-pulse inline-block" />
              ) : (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-800" /> {user?.email}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-amber-100/80 px-5 py-3 rounded-xl border border-amber-200/90 flex items-center gap-3 shadow-xs">
          <Award className="w-6 h-6 text-amber-800" />
          <div>
            <p className="text-[11px] font-medium text-amber-900/80">Vai trò</p>
            {isDataLoading ? (
              <div className="h-5 w-24 bg-amber-200/80 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-base font-bold text-zinc-900">{formatRoleLabel(user?.roles?.[0])}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
