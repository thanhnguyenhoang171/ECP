'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import {
  Menu as MenuIcon,
  ChevronDown,
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Warehouse,
  Boxes,
  Receipt,
  ShoppingCart,
  Truck,
  Store,
  BookOpen,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  type LucideIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import nprogress from 'nprogress';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

import { useLogout } from '@/features/auth/hooks/use-auth-mutation';

interface SubMenuItem {
  key: string;
  label: string;
  icon?: LucideIcon;
}

interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  children?: SubMenuItem[];
  requiredRoles?: string[];
}

const menuItems: MenuItem[] = [
  { key: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  {
    key: 'products-group',
    label: 'Sản phẩm',
    icon: Package,
    children: [
      { key: '/products', label: 'Sản phẩm', icon: Package },
      { key: '/categories', label: 'Danh mục', icon: FolderTree },
      { key: '/brands', label: 'Thương hiệu', icon: Tag },
    ],
  },
  {
    key: 'inventory-group',
    label: 'Kho hàng',
    icon: Warehouse,
    children: [
      { key: '/stock', label: 'Tồn kho', icon: Boxes },
      { key: '/goods-receipt', label: 'Nhập kho', icon: Receipt },
      { key: '/purchase-orders', label: 'Đơn mua hàng', icon: ShoppingCart },
      { key: '/suppliers', label: 'Nhà cung cấp', icon: Truck },
      { key: '/warehouses', label: 'Kho bãi', icon: Store },
      { key: '/inventory-ledger', label: 'Sổ cái kho', icon: BookOpen },
    ],
  },
  { key: '/users', label: 'Tài khoản', icon: Users, requiredRoles: ['ROLE_SUPER_ADMIN'] },
  {
    key: 'system-group',
    label: 'Hệ thống',
    icon: Settings,
    children: [
      { key: '/audit-logs', label: 'Nhật ký kiểm toán', icon: ShieldCheck },
    ],
  },
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
  const Icon = item.icon;
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
                <Icon size={18} />
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
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            return (
              <DropdownMenuItem key={child.key} asChild className="cursor-pointer rounded-md focus:bg-primary focus:text-white">
                <Link href={child.key} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium" onClick={onNavigate}>
                  {ChildIcon && <ChildIcon size={16} />}
                  <span>{child.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
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
              pathname === item.key ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            onClick={onNavigate}
          >
            <Icon size={18} />
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
              isActive ? "text-white bg-slate-800/60 font-semibold" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
            <ChevronDown size={14} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
          </Button>
          <div className={cn(
            "mt-1 ml-4 border-l border-slate-800 pl-2 overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 opacity-100 mb-2" : "max-h-0 opacity-0"
          )}>
            {item.children?.map((child) => {
              const ChildIcon = child.icon;
              return (
                <Link
                  key={child.key}
                  href={child.key}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all mb-1",
                    pathname === child.key 
                      ? "bg-blue-500/20 text-blue-400 font-extrabold border-l-2 border-blue-500 shadow-2xs" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={onNavigate}
                >
                  {ChildIcon && <ChildIcon size={16} />}
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <Link
          href={item.key}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            pathname === item.key 
              ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
          onClick={onNavigate}
        >
          <Icon size={18} />
          <span>{item.label}</span>
        </Link>
      )}
    </div>
  );
});
SidebarItem.displayName = 'SidebarItem';

export default function NextAdminLayout({ children }: { children: React.ReactNode }) {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
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

  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const handleNavigate = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return 'Quản trị viên';
    const cleanRole = role.startsWith('ROLE_') ? role.replace('ROLE_', '') : role;
    switch (cleanRole) {
      case 'SUPER_ADMIN':
        return 'Quản trị viên cao cấp';
      case 'ADMIN':
        return 'Quản trị viên';
      case 'MANAGER':
        return 'Quản lý';
      case 'STAFF':
      case 'EMPLOYEE':
        return 'Nhân viên';
      case 'USER':
        return 'Thành viên';
      default:
        return cleanRole;
    }
  };

  const renderSidebarContent = (mobile = false) => {
    // Filter sidebar menu items based on authorized user roles
    const filteredMenuItems = menuItems.filter(item => {
      if (!item.requiredRoles) return true;
      if (!user?.roles) return false;
      if (!user?.roles?.length) return false;
      return item.requiredRoles.some(reqRole => 
        user.roles.includes(reqRole) || user.roles.includes(reqRole.replace('ROLE_', ''))
      );
    });

    return (
      <div className="flex flex-col h-full bg-slate-900">
        <div className={cn(
          "h-16 flex items-center border-b border-slate-800 shrink-0 transition-all duration-300",
          !isSidebarCollapsed || mobile ? "justify-start px-6" : "justify-center px-0"
        )}>
          <div className={cn(
            "relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-700",
            (!isSidebarCollapsed || mobile) && "mr-3"
          )}>
            <Image 
              src="/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg" 
              alt="Logo" 
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          {(!isSidebarCollapsed || mobile) && (
            <span className="font-bold text-lg text-white tracking-tight">
              CACAO ADMIN
            </span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {filteredMenuItems.map((item) => (
            <SidebarItem 
              key={item.key} 
              item={item} 
              isCollapsed={isSidebarCollapsed} 
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
              "w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-medium rounded-lg transition-all flex items-center gap-3",
              isSidebarCollapsed && !mobile ? "justify-center px-0 text-xs font-bold" : "justify-start"
            )} 
            onClick={() => {
              handleLogout();
              if (mobile) handleNavigate();
            }}
          >
            <LogOut size={18} />
            {(!isSidebarCollapsed || mobile) && <span>Đăng xuất</span>}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-transparent">
      <aside className={cn(
        "hidden lg:block transition-all duration-300 ease-in-out z-30 shadow-xl",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        {renderSidebarContent()}
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 z-20 bg-slate-900 border-b border-slate-800 shadow-md shrink-0 text-white">
          <div className="flex items-center gap-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800">
                  <MenuIcon size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-none [&>button]:text-white [&>button]:opacity-80 hover:[&>button]:opacity-100">
                {renderSidebarContent(true)}
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-800" onClick={toggleSidebar}>
              <MenuIcon size={20} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-800 p-1.5 px-2.5 rounded-xl transition-all group border border-transparent hover:border-slate-700">
                  <Avatar className="h-9 w-9 border border-slate-700 shadow-sm overflow-hidden ring-2 ring-transparent group-hover:ring-primary/40 transition-all">
                    {user?.avatarUrl && (
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={user?.email || 'Avatar'}
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <AvatarFallback className="bg-slate-800 text-slate-200 font-bold text-xs">
                      {getInitials(user?.fullName || ((user?.lastName || user?.firstName) ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : user?.email))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {user?.fullName || ((user?.lastName || user?.firstName)
                        ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
                        : (user?.email || 'Admin User'))}
                    </span>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full mt-0.5 tracking-wide">
                      {getRoleLabel(user?.roles?.[0] || user?.role)}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-200 transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-2 p-1.5 shadow-2xl bg-slate-900 border-slate-800 text-white rounded-xl">
                <DropdownMenuItem onClick={() => {
                  router.push('/profile');
                  handleNavigate();
                }} className="cursor-pointer py-2 px-3 rounded-lg focus:bg-slate-800 focus:text-white font-medium text-slate-300">
                  <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-800" />
                <DropdownMenuItem onClick={() => {
                  handleLogout();
                  handleNavigate();
                }} className="text-rose-400 focus:text-rose-300 focus:bg-rose-950/40 cursor-pointer py-2 px-3 rounded-lg font-semibold">
                  <span className="text-sm font-bold">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
          <div className="max-w-[1600px] mx-auto min-h-full">
            <div className="animate-page-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


