'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Database,
  Users,
  LogOut,
  Menu as MenuIcon,
  ChevronRight,
  Package,
  Warehouse,
  History,
  ScanBarcode,
  ShoppingCart,
  CreditCard,
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import nprogress from 'nprogress';

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
      { key: '/skus', label: 'SKUs' },
      { key: '/categories', label: 'Danh mục' },
    ],
  },
  {
    key: 'inventory-group',
    icon: <Database size={18} />,
    label: 'Quản lý kho',
    children: [
      { key: '/stock', label: 'Tồn kho' },
      { key: '/warehouses', label: 'Kho hàng' },
      { key: '/inventory-ledger', label: 'Sổ nhật ký' },
      { key: '/barcode-scans', label: 'Quét mã vạch' },
    ],
  },
  {
    key: 'sales-group',
    icon: <ShoppingCart size={18} />,
    label: 'Kinh doanh',
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
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!item.children;
  const isActive = pathname === item.key || item.children?.some(c => pathname === c.key);
  
  useEffect(() => {
    if (isActive && !isCollapsed) {
      const timer = setTimeout(() => setIsOpen(true), 0);
      return () => clearTimeout(timer);
    }
  }, [isActive, isCollapsed]);

  if (isCollapsed && !isMobile && hasChildren) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-center h-10 px-0 mb-1.5 transition-all duration-200",
                  isActive ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
        <DropdownMenuContent side="right" align="start" className="w-52 bg-white shadow-2xl border-slate-100 ml-2 animate-in fade-in slide-in-from-left-2 duration-200 p-1.5">
          <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-2">{item.label}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-50" />
          {item.children?.map((child) => (
            <DropdownMenuItem key={child.key} asChild className="cursor-pointer rounded-md focus:bg-blue-50 focus:text-blue-600">
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
              "flex items-center justify-center h-10 w-10 mx-auto rounded-lg mb-1.5 transition-all duration-200 border border-transparent",
              pathname === item.key ? "bg-blue-50 text-blue-600 shadow-sm border-blue-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
    <div className="mb-1.5 px-2">
      {hasChildren ? (
        <>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 h-auto",
              isActive ? "text-blue-600 bg-blue-50/50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(isActive ? "text-blue-600" : "text-slate-400")}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <ChevronDown size={14} className={cn("transition-transform duration-300 text-slate-400", isOpen && "rotate-180 text-blue-600")} />
          </Button>
          <div className={cn(
            "mt-1 ml-4 border-l-2 border-slate-100 pl-2 overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100 mb-2" : "max-h-0 opacity-0"
          )}>
            {item.children?.map((child) => (
              <Link
                key={child.key}
                href={child.key}
                className={cn(
                  "block px-4 py-2 text-xs font-medium rounded-md transition-all mb-1",
                  pathname === child.key 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
            "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
            pathname === item.key 
              ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
          onClick={onNavigate}
        >
          <span className={cn(pathname === item.key ? "text-white" : "text-slate-400")}>{item.icon}</span>
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    router.push('/login');
  }, [router]);

  const handleNavigate = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const renderSidebarContent = (mobile = false) => (
    <div className="flex flex-col h-full bg-white will-change-transform">
      <div className={cn(
        "h-16 flex items-center px-4 border-b border-slate-100 shrink-0",
        !isCollapsed || mobile ? "justify-start" : "justify-center"
      )}>
        <div className="bg-blue-600 p-1.5 rounded-lg mr-2 shrink-0">
          <Package className="text-white h-5 w-5" />
        </div>
        <span className="font-black text-lg text-slate-900 italic tracking-tighter transition-opacity duration-300">
          {(!isCollapsed || mobile) ? 'ADMIN ECP' : ''}
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar bg-white">
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
      <div className="p-4 border-t border-slate-50 shrink-0">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-red-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-lg transition-all",
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
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <aside className={cn(
        "hidden lg:block transition-all duration-300 ease-in-out border-r border-slate-200 bg-white will-change-transform z-30",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {renderSidebarContent()}
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-slate-100 text-slate-600">
                  <MenuIcon size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-none shadow-2xl">
                {renderSidebarContent(true)}
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" className="hidden lg:flex hover:bg-slate-100 text-slate-400" onClick={() => setIsCollapsed(!isCollapsed)}>
              <MenuIcon size={20} />
            </Button>

            <div className="hidden md:flex items-center bg-slate-100/50 px-4 py-2 rounded-xl text-slate-400 w-72 border border-transparent focus-within:border-blue-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-200 group">
              <Search size={16} className="mr-2 group-focus-within:text-blue-500 transition-colors" />
              <input placeholder="Tìm kiếm nhanh..." className="bg-transparent border-none outline-none text-xs w-full text-slate-900 placeholder:text-slate-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 text-slate-400">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-none">Thông báo mới</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-full transition-all border border-transparent hover:border-slate-100 group">
                  <div className="hidden sm:flex flex-col items-end leading-tight pr-1 text-right">
                    <span className="text-xs font-bold text-slate-900">Admin User</span>
                    <span className="text-[10px] text-blue-600 uppercase font-black tracking-tighter">Quản trị viên</span>
                  </div>
                  <Avatar className="h-9 w-9 border-2 border-blue-100 shadow-sm group-hover:border-blue-300 transition-all">
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs italic">AD</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-white shadow-2xl border-slate-100 mt-2 animate-in slide-in-from-top-2 duration-200 p-1.5">
                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Quản lý tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem onClick={() => {
                  router.push('/profile');
                  handleNavigate();
                }} className="cursor-pointer rounded-md py-2.5 px-3 focus:bg-blue-50 focus:text-blue-600">
                  <UserCircle className="mr-2 h-4 w-4 opacity-70" /> <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-md py-2.5 px-3 focus:bg-blue-50 focus:text-blue-600">
                  <Settings className="mr-2 h-4 w-4 opacity-70" /> <span className="text-sm font-medium">Cài đặt hệ thống</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem onClick={() => {
                  handleLogout();
                  handleNavigate();
                }} className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer rounded-md py-2.5 px-3">
                  <LogOut className="mr-2 h-4 w-4" /> <span className="text-sm font-bold">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto min-h-full overflow-hidden">
            <div 
              key={pathname}
              className="animate-page-fade-in will-change-transform"
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
