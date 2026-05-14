'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import {
  LayoutDashboard,
  ShoppingBag,
  Database,
  LogOut,
  Menu as MenuIcon,
  Package,
  ShoppingCart,
  UserCircle,
  Bell,
  Search,
  Settings,
  ChevronDown
} from 'lucide-react';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import nprogress from 'nprogress';
import { useAuthStore } from '@/store/authStore';

// Lazy load
const Sheet = dynamic(() => import("@/components/ui/sheet").then(m => m.Sheet));
const SheetContent = dynamic(() => import("@/components/ui/sheet").then(m => m.SheetContent));
const SheetTrigger = dynamic(() => import("@/components/ui/sheet").then(m => m.SheetTrigger));

interface SubMenuItem {
  key: string;
  label: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { key: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
  {
    key: 'products-group',
    icon: <ShoppingBag size={18} />,
    label: 'Sản phẩm & SKU',
    children: [
      { key: '/products', label: 'Sản phẩm' },
      { key: '/skus', label: 'Danh sách SKU' },
      { key: '/categories', label: 'Danh mục' },
    ],
  },
  {
    key: 'inventory-group',
    icon: <Database size={18} />,
    label: 'Kho hàng',
    children: [
      { key: '/stock', label: 'Tồn kho' },
      { key: '/warehouses', label: 'Kho bãi' },
      { key: '/inventory-ledger', label: 'Sổ cái kho' },
      { key: '/barcode-scans', label: 'Quét mã vạch' },
    ],
  },
  {
    key: 'sales-group',
    icon: <ShoppingCart size={18} />,
    label: 'Bán hàng',
    children: [
      { key: '/orders', label: 'Đơn hàng' },
      { key: '/payments', label: 'Thanh toán' },
      { key: '/customers', label: 'Khách hàng' },
    ],
  },
  { key: '/users', icon: <UserCircle size={18} />, label: 'Nhân viên' },
];

const SidebarItem = memo(({ 
  item, 
  isCollapsed, 
  pathname, 
  isMobile,
  onNavigate
}: { 
  item: MenuItem; 
  isCollapsed: boolean; 
  pathname: string;
  isMobile?: boolean;
  onNavigate?: () => void;
}) => {
  const hasChildren = !!item.children;
  const isActive = pathname === item.key || item.children?.some(c => pathname === c.key);
  const [isOpen, setIsOpen] = useState(false);
  const [prevIsActive, setPrevIsActive] = useState(isActive);

  if (isActive !== prevIsActive) {
    setPrevIsActive(isActive);
    if (isActive && !isCollapsed) {
      setIsOpen(true);
    }
  }

  // Effect removed to avoid cascading renders warning

  if (isCollapsed && !isMobile && hasChildren) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-center h-10 px-0 mb-1 transition-all duration-200",
                  isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.icon}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium bg-slate-900 text-white border-none shadow-xl">
            {item.label}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" className="w-52 bg-slate-900 shadow-2xl border-slate-800 ml-2 p-1 text-white">
          <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-2">{item.label}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />
          {item.children?.map((child) => (
            <DropdownMenuItem key={child.key} asChild className="cursor-pointer rounded-md focus:bg-primary focus:text-white">
              <Link href={child.key} className="w-full px-3 py-2 text-sm font-medium" onClick={onNavigate}>{child.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isCollapsed && !isMobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.key}
            className={cn(
              "flex items-center justify-center h-10 w-10 mx-auto rounded-lg mb-1 transition-all duration-200",
              pathname === item.key ? "bg-primary text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            onClick={onNavigate}
          >
            {item.icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium bg-slate-900 text-white border-none shadow-xl">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="mb-1">
      {hasChildren ? (
        <>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 h-auto",
              isActive ? "text-white bg-slate-800/50" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(isActive ? "text-primary" : "text-slate-500")}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <ChevronDown size={14} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
          </Button>
          <div className={cn(
            "mt-1 ml-4 border-l border-slate-800 pl-2 overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 opacity-100 mb-2" : "max-h-0 opacity-0"
          )}>
            {item.children?.map((child) => (
              <Link
                key={child.key}
                href={child.key}
                className={cn(
                  "block px-4 py-2 text-sm font-medium rounded-md transition-all mb-1",
                  pathname === child.key 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-500 hover:bg-slate-800 hover:text-white"
                )}
                onClick={onNavigate}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <Link
          href={item.key}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            pathname === item.key 
              ? "bg-primary text-white shadow-md" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
          onClick={onNavigate}
        >
          <span className={cn(pathname === item.key ? "text-white" : "text-slate-500")}>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      )}
    </div>
  );
});
SidebarItem.displayName = 'SidebarItem';

export default function NextAdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    nprogress.start();
    const timer = setTimeout(() => nprogress.done(), 100);
    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
  }, [pathname]);

  const { clearAuth, accessToken, user } = useAuthStore();

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push('/login');
    }
  }, [router, clearAuth, accessToken]);

  const handleNavigate = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const renderSidebarContent = (mobile = false) => (
    <div className="flex flex-col h-full bg-slate-900">
      <div className={cn(
        "h-16 flex items-center px-6 border-b border-slate-800 shrink-0",
        !isCollapsed || mobile ? "justify-start" : "justify-center"
      )}>
        <div className="bg-primary p-1.5 rounded-lg mr-3 shrink-0">
          <Package className="text-white h-5 w-5" />
        </div>
        {(!isCollapsed || mobile) && (
          <span className="font-bold text-lg text-white tracking-tight">
            ECP ADMIN
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.key} 
            item={item} 
            isCollapsed={isCollapsed} 
            pathname={pathname}
            isMobile={mobile}
            onNavigate={mobile ? handleNavigate : undefined}
          />
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 shrink-0">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-medium rounded-lg transition-all",
            isCollapsed && !mobile ? "justify-center px-0" : "justify-start gap-3"
          )} 
          onClick={() => {
            handleLogout();
            if (mobile) handleNavigate();
          }}
        >
          <LogOut size={18} />
          {(!isCollapsed || mobile) && <span>Đăng xuất</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className={cn(
        "hidden lg:block transition-all duration-300 ease-in-out z-30 shadow-xl",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {renderSidebarContent()}
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 z-20 bg-white border-b border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-600">
                  <MenuIcon size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-none">
                {renderSidebarContent(true)}
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" className="hidden lg:flex text-slate-400 hover:text-slate-600" onClick={() => setIsCollapsed(!isCollapsed)}>
              <MenuIcon size={20} />
            </Button>

            <div className="hidden md:flex items-center px-4 py-2 rounded-lg w-72 bg-slate-100 border border-slate-200 focus-within:border-primary/50 focus-within:bg-white transition-all group">
              <Search size={16} className="mr-2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input placeholder="Tìm kiếm..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thông báo</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-1.5 rounded-lg transition-all group">
                  <div className="hidden sm:flex flex-col items-end leading-tight">
                    <span className="text-sm font-semibold text-slate-900">{user?.username || 'Admin User'}</span>
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                      {user?.roles?.[0] || 'Quản trị viên'}
                    </span>
                  </div>
                  <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                      {getInitials(user?.username)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 mt-2 p-1">
                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  router.push('/profile');
                  handleNavigate();
                }} className="cursor-pointer py-2 px-3">
                  <UserCircle className="mr-2 h-4 w-4 opacity-70" /> <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2 px-3">
                  <Settings className="mr-2 h-4 w-4 opacity-70" /> <span className="text-sm font-medium">Cài đặt hệ thống</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  handleLogout();
                  handleNavigate();
                }} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2 px-3">
                  <LogOut className="mr-2 h-4 w-4" /> <span className="text-sm font-bold">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto min-h-full">
            <div 
              key={pathname}
              className="animate-page-fade-in"
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
