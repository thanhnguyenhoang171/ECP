"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavItem, getAdminMenuItems } from "@/config/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = getAdminMenuItems();

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="h-16 flex items-center justify-center border-b border-slate-200">
        <span className="text-xl font-bold text-blue-600">
          {collapsed ? "ECP" : "Admin ECP"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem key={item.title} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
      </div>

      <div className="p-4 border-t border-slate-200">
        <button 
          onClick={() => {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
          }}
          className={cn(
            "flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors",
            collapsed ? "justify-center" : "space-x-3"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
}

function SidebarItem({ item, collapsed, pathname }: { item: NavItem; collapsed?: boolean; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname || item.children?.some(child => child.href === pathname);

  if (hasChildren && !collapsed) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <div className="flex items-center space-x-3">
            {item.icon && <item.icon size={20} />}
            <span>{item.title}</span>
          </div>
          <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
        </button>
        {isOpen && (
          <div className="pl-10 space-y-1">
            {item.children?.map((child) => (
              <Link
                key={child.title}
                href={child.href || "#"}
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === child.href ? "text-blue-600 bg-blue-50" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50",
        collapsed ? "justify-center" : "space-x-3"
      )}
    >
      {item.icon && <item.icon size={20} />}
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
}
