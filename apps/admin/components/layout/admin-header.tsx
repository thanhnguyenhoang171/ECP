"use client";

import { Menu, Search, Bell, User, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AdminHeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  userName?: string;
  userRole?: string;
}

export function AdminHeader({
  collapsed,
  onToggleSidebar,
  userName = "Admin User",
  userRole = "Quản trị viên",
}: AdminHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <div className="hidden md:flex items-center text-sm text-slate-500">
          <span>ECP</span>
          <span className="mx-2">/</span>
          <span className="text-slate-800 font-medium">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center">
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
        </div>

        <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

        <button className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-lg transition-all group">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-semibold text-slate-800">{userName}</span>
            <span className="text-[11px] text-blue-600 uppercase tracking-wider font-bold">
              {userRole}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </button>
      </div>
    </header>
  );
}
