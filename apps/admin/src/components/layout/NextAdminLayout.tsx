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

// Lazy load các thành phần nặng cho mobile
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
  { key: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
  {
    key: 'products-group',
    icon: <ShoppingBag size={20} />,
    label: 'Sản phẩm & SKU',
    children: [
      { key: '/products', label: 'Sản phẩm' },
      { key: '/skus', label: 'SKUs' },
      { key: '/categories', label: 'Danh mục' },
    ],
  },
  {
    key: 'inventory-group',
    icon: <Database size={20} />,
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
    icon: <ShoppingCart size={20} />,
    label: 'Kinh doanh',
    children: [
      { key: '/orders', label: 'Đơn hàng' },
      { key: '/payments', label: 'Thanh toán' },
      { key: '/customers', label: 'Khách hàng' },
    ],
  },
  { key: '/users', icon: <UserCircle size={20} />, label: 'Nhân viên' },
];

const SidebarItem = memo(({ 
  item, 
  isCollapsed, 
  pathname, 
  isMobile 
}: { 
  item: MenuItem; 
  isCollapsed: boolean; 
  pathname: string;
  isMobile?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!item.children;
  const isActive = pathname === item.key || item.children?.some(c => pathname === c.key);
  
  useEffect(() => {
    if (isActive && !isCollapsed) setIsOpen(true);
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
                  "w-full justify-center h-10 px-0 mb-1 transition-all duration-200",
                  isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {item.icon}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium shadow-lg">
            {item.label}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" className="w-48 bg-white shadow-xl ml-2 animate-in fade-in slide-in-from-left-1">
          <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.children?.map((child) => (
            <DropdownMenuItem key={child.key} asChild className="cursor-pointer">
              <Link href={child.key} className="w-full">{child.label}</Link>
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
              "flex items-center justify-center h-10 w-10 mx-auto rounded-md mb-1 transition-all duration-200",
              pathname === item.key ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {item.icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium shadow-lg">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="mb-1">
      {hasChildren ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-all",
              isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <ChevronDown size={14} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
          </button>
          <div className={cn(
            "mt-1 ml-4 border-l pl-4 overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100 mb-2" : "max-h-0 opacity-0"
          )}>
            {item.children?.map((child) => (
              <Link
                key={child.key}
                href={child.key}
                className={cn(
                  "block px-3 py-1.5 text-xs font-medium rounded-md transition-colors mb-1",
                  pathname === child.key 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted"
                )}
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
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            pathname === item.key 
              ? "bg-primary/10 text-primary font-bold shadow-sm" 
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      )}
    </div>
  );
});
SidebarItem.displayName = 'SidebarItem';

export default function NextAdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const SidebarContent = useCallback(({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-background will-change-transform">
      <div className={cn(
        "h-16 flex items-center px-4 border-b shrink-0",
        !isCollapsed || mobile ? "justify-start" : "justify-center"
      )}>
        <span className="font-bold text-lg md:text-xl text-primary italic whitespace-nowrap tracking-tight">
          {(!isCollapsed || mobile) ? 'Admin ECP' : 'ECP'}
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.key} 
            item={item} 
            isCollapsed={isCollapsed} 
            pathname={pathname}
            isMobile={mobile}
          />
        ))}
      </nav>
      <div className="p-4 border-t shrink-0">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-red-500 hover:bg-red-50 font-bold",
            isCollapsed && !mobile ? "justify-center px-0" : "justify-start gap-3"
          )} 
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {(!isCollapsed || mobile) && <span>Đăng xuất</span>}
        </Button>
      </div>
    </div>
  ), [isCollapsed, pathname, handleLogout]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">
      <aside className={cn(
        "hidden lg:block transition-all duration-300 ease-in-out border-r bg-background will-change-transform",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-muted">
                  <MenuIcon size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-none">
                <SidebarContent mobile />
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" className="hidden lg:flex hover:bg-muted" onClick={() => setIsCollapsed(!isCollapsed)}>
              <MenuIcon size={20} />
            </Button>

            <div className="hidden md:flex items-center bg-muted/50 px-3 py-1.5 rounded-full text-muted-foreground w-64 border focus-within:ring-1 focus-within:ring-primary transition-all">
              <Search size={16} className="mr-2" />
              <input placeholder="Tìm kiếm nhanh..." className="bg-transparent border-none outline-none text-xs w-full" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-muted">
              <Bell size={20} />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[10px] border-2 border-white text-white">3</Badge>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-1.5 rounded-full transition-all border border-transparent hover:border-border">
                  <div className="hidden sm:flex flex-col items-end leading-tight pr-1">
                    <span className="text-xs font-bold text-foreground">Admin User</span>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-tighter">Quản trị viên</span>
                  </div>
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-primary/10 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs italic">AD</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white shadow-xl mt-1 animate-in slide-in-from-top-1">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" /> <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> <span>Cài đặt hệ thống</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
