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

import { useBackground } from '@/components/providers/BackgroundProvider';

const menuItems: MenuItem[] = [
  { key: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  {
    key: 'products-group',
    icon: <ShoppingBag size={18} />,
    label: 'Products & SKU',
    children: [
      { key: '/products', label: 'Products' },
      { key: '/skus', label: 'SKUs' },
      { key: '/categories', label: 'Categories' },
    ],
  },
  {
    key: 'inventory-group',
    icon: <Database size={18} />,
    label: 'Inventory',
    children: [
      { key: '/stock', label: 'Stock' },
      { key: '/warehouses', label: 'Warehouses' },
      { key: '/inventory-ledger', label: 'Ledger' },
      { key: '/barcode-scans', label: 'Barcode' },
    ],
  },
  {
    key: 'sales-group',
    icon: <ShoppingCart size={18} />,
    label: 'Sales',
    children: [
      { key: '/orders', label: 'Orders' },
      { key: '/payments', label: 'Payments' },
      { key: '/customers', label: 'Customers' },
    ],
  },
  { key: '/users', icon: <UserCircle size={18} />, label: 'Staff' },
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
                  isActive ? "bg-white/20 text-white shadow-sm border border-white/20" : "text-white/60 hover:bg-white/10 hover:text-white"
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
        <DropdownMenuContent side="right" align="start" className="w-52 bg-white/10 backdrop-blur-xl shadow-2xl border-white/20 ml-2 animate-in fade-in slide-in-from-left-2 duration-200 p-1.5 text-white">
          <DropdownMenuLabel className="text-xs font-bold text-white/40 uppercase tracking-widest px-3 py-2">{item.label}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          {item.children?.map((child) => (
            <DropdownMenuItem key={child.key} asChild className="cursor-pointer rounded-md focus:bg-white/20 focus:text-white">
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
              pathname === item.key ? "bg-white/20 text-white shadow-sm border-white/20" : "text-white/60 hover:bg-white/10 hover:text-white"
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
              isActive ? "text-white bg-white/20" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(isActive ? "text-white" : "text-white/50")}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <ChevronDown size={14} className={cn("transition-transform duration-300 text-white/40", isOpen && "rotate-180 text-white")} />
          </Button>
          <div className={cn(
            "mt-1 ml-4 border-l border-white/10 pl-2 overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100 mb-2" : "max-h-0 opacity-0"
          )}>
            {item.children?.map((child) => (
              <Link
                key={child.key}
                href={child.key}
                className={cn(
                  "block px-4 py-2 text-xs font-medium rounded-md transition-all mb-1",
                  pathname === child.key 
                    ? "bg-white/30 text-white shadow-lg border border-white/20" 
                    : "text-white/60 hover:bg-white/10 hover:text-white"
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
              ? "bg-white text-black shadow-lg border border-white/20" 
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
          onClick={onNavigate}
        >
          <span className={cn(pathname === item.key ? "text-black" : "text-white/50")}>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      )}
    </div>
  );
});
SidebarItem.displayName = 'SidebarItem';

export default function NextAdminLayout({ children }: { children: React.ReactNode }) {
  const { currentBackground, setBackground, availableBackgrounds } = useBackground();
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
    <div className="flex flex-col h-full bg-transparent will-change-transform">
      <div className={cn(
        "h-16 flex items-center px-4 border-b border-white/10 shrink-0",
        !isCollapsed || mobile ? "justify-start" : "justify-center"
      )}>
        <div className="bg-white p-1.5 rounded-lg mr-2 shrink-0 shadow-lg">
          <Package className="text-black h-5 w-5" />
        </div>
        <span className="font-black text-lg text-white italic tracking-tighter transition-opacity duration-300">
          {(!isCollapsed || mobile) ? 'ADMIN ECP' : ''}
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
            onNavigate={mobile ? handleNavigate : undefined}
          />
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 shrink-0">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-red-300 hover:bg-red-500/20 hover:text-red-200 font-bold rounded-lg transition-all",
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
    <div 
      className={cn(
        "flex h-screen overflow-hidden bg-[#f8fafc] bg-cover bg-center bg-transition relative",
        currentBackground ? "text-white" : ""
      )}
      style={currentBackground ? { backgroundImage: `url('${currentBackground}')` } : {}}
    >
      {currentBackground && <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-none" />}
      
      <aside className={cn(
        "hidden lg:block transition-all duration-300 ease-in-out border-r border-white/10 will-change-transform z-30",
        isCollapsed ? "w-20" : "w-64",
        currentBackground ? "bg-white/5 backdrop-blur-2xl" : "bg-white"
      )}>
        {renderSidebarContent()}
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className={cn(
          "h-16 flex items-center justify-between px-4 sm:px-6 z-20 shadow-sm shrink-0 border-b border-white/10 transition-all",
          currentBackground ? "bg-white/10 backdrop-blur-2xl" : "bg-white/80 backdrop-blur-xl"
        )}>
          <div className="flex items-center gap-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/10 text-white">
                  <MenuIcon size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-none shadow-2xl bg-black/80 backdrop-blur-2xl">
                {renderSidebarContent(true)}
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" className={cn("hidden lg:flex hover:bg-white/10", currentBackground ? "text-white/60" : "text-slate-400")} onClick={() => setIsCollapsed(!isCollapsed)}>
              <MenuIcon size={20} />
            </Button>

            <div className={cn(
              "hidden md:flex items-center px-4 py-2 rounded-xl w-72 border transition-all duration-200 group",
              currentBackground 
                ? "bg-white/10 border-white/10 focus-within:border-white focus-within:bg-white/20 text-white" 
                : "bg-slate-100/50 border-transparent focus-within:border-blue-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 text-slate-400"
            )}>
              <Search size={16} className={cn("mr-2 group-focus-within:text-white transition-colors", currentBackground ? "text-white/40" : "text-slate-400")} />
              <input placeholder="Search..." className="bg-transparent border-none outline-none text-xs w-full placeholder:text-white/40 text-current" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Background Switcher */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("hover:bg-white/10", currentBackground ? "text-white/60" : "text-slate-400")}>
                      <ShoppingBag size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-none">Change Background</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56 bg-white/20 backdrop-blur-2xl shadow-2xl border-white/20 p-2 text-white">
                <DropdownMenuLabel className="text-xs font-bold text-white/50 uppercase tracking-widest px-2 py-2">Select Theme</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="grid grid-cols-2 gap-2 p-2">
                  {availableBackgrounds.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => setBackground(bg.url)}
                      className={cn(
                        "h-16 rounded-lg border-2 transition-all relative group overflow-hidden",
                        currentBackground === bg.url ? "border-white shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      {bg.url ? (
                        <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold">Default</div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white">{bg.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("relative hover:bg-white/10", currentBackground ? "text-white/60" : "text-slate-400")}>
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-none">New Notifications</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-1 rounded-full transition-all border border-transparent hover:border-white/10 group">
                  <div className="hidden sm:flex flex-col items-end leading-tight pr-1 text-right">
                    <span className={cn("text-xs font-bold", currentBackground ? "text-white" : "text-slate-900")}>Admin User</span>
                    <span className={cn("text-[10px] uppercase font-black tracking-tighter", currentBackground ? "text-white/70" : "text-blue-600")}>Administrator</span>
                  </div>
                  <Avatar className="h-9 w-9 border-2 border-white/20 shadow-sm group-hover:border-white transition-all">
                    <AvatarFallback className="bg-white text-black font-bold text-xs italic">AD</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-white/10 backdrop-blur-2xl shadow-2xl border-white/10 mt-2 animate-in slide-in-from-top-2 duration-200 p-1.5 text-white">
                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-white/40 uppercase tracking-widest">Account Management</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => {
                  router.push('/profile');
                  handleNavigate();
                }} className="cursor-pointer rounded-md py-2.5 px-3 focus:bg-white/20">
                  <UserCircle className="mr-2 h-4 w-4 opacity-70" /> <span className="text-sm font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-md py-2.5 px-3 focus:bg-white/20">
                  <Settings className="mr-2 h-4 w-4 opacity-70" /> <span className="text-sm font-medium">System Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => {
                  handleLogout();
                  handleNavigate();
                }} className="text-red-300 focus:text-red-200 focus:bg-red-500/20 cursor-pointer rounded-md py-2.5 px-3">
                  <LogOut className="mr-2 h-4 w-4" /> <span className="text-sm font-bold">Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar pb-20 sm:pb-10">
          <div className="max-w-7xl mx-auto min-h-full">
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
