'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import {
  LayoutDashboard,
  ShoppingBag,
  Database,
  LogOut,
  Menu as MenuIcon,
  ShoppingCart,
  UserCircle,
  Bell,
  Search,
  Settings,
  ChevronDown,
  FileClock,
  ScanBarcode,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Trash2,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';



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
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

import { useLogout } from '@/features/auth/hooks/use-auth-mutation';

// Lazy load
const Sheet = dynamic(() => import("@/components/ui/sheet").then(m => m.Sheet));
const SheetContent = dynamic(() => import("@/components/ui/sheet").then(m => m.SheetContent));
const SheetTrigger = dynamic(() => import("@/components/ui/sheet").then(m => m.SheetTrigger));

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import BarcodeScanner from '@/features/inventory/components/BarcodeScanner';



interface SubMenuItem {
  key: string;
  label: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  children?: SubMenuItem[];
  requiredRoles?: string[];
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
      { key: '/brands', label: 'Thương hiệu' },
    ],
  },
  {
    key: 'inventory-group',
    icon: <Database size={18} />,
    label: 'Kho hàng',
    children: [
      { key: '/stock', label: 'Tồn kho' },
      { key: '/goods-receipt', label: 'Nhập kho' },
      { key: '/suppliers', label: 'Nhà cung cấp' },
      { key: '/warehouses', label: 'Kho bãi' },
      { key: '/inventory-ledger', label: 'Sổ cái kho' },
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
      { key: '/promotions', label: 'Mã giảm giá' },
    ],
  },
  { key: '/users', icon: <UserCircle size={18} />, label: 'Nhân viên' },
  {
    key: 'system-group',
    icon: <Settings size={18} />,
    label: 'Hệ thống',
    children: [
      { key: '/settings', label: 'Cấu hình chung' },
      { key: '/settings/storefront', label: 'Giao diện Website' },
      { key: '/audit-logs', label: 'Nhật ký kiểm toán' },
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

interface NotificationItem {
  id: string;
  type: 'order' | 'stock' | 'payment' | 'system';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  link?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'order',
    title: 'Đơn hàng mới chờ duyệt',
    description: 'Khách hàng Nguyễn Văn Nam vừa đặt đơn hàng #DH-8902 trị giá 34,990,000đ.',
    time: '5 phút trước',
    isRead: false,
    link: '/orders',
  },
  {
    id: 'n-2',
    type: 'stock',
    title: 'Cảnh báo tồn kho cực thấp',
    description: 'Sản phẩm Samsung Galaxy S24 Ultra (Titanium Black / 512GB) đã hết hàng (0 cái).',
    time: '25 phút trước',
    isRead: false,
    link: '/stock',
  },
  {
    id: 'n-3',
    type: 'payment',
    title: 'Giao dịch Momo bị từ chối',
    description: 'Thanh toán Momo đơn hàng #DH-8872 không thành công. Lý do: Người dùng hủy giao dịch.',
    time: '1 giờ trước',
    isRead: true,
    link: '/payments',
  },
  {
    id: 'n-4',
    type: 'system',
    title: 'Nhập kho thành công',
    description: 'Lô hàng #NK-1092 chứa 50 chiếc AirPods Pro đã được nhập vào Kho Quận 1.',
    time: '2 giờ trước',
    isRead: true,
    link: '/goods-receipt',
  }
];

const notificationTypeIcons = {
  order: ShoppingCart,
  stock: AlertTriangle,
  payment: CreditCard,
  system: CheckCircle2,
};

const notificationTypeColors = {
  order: 'bg-blue-50 text-blue-600 border border-blue-100',
  stock: 'bg-rose-50 text-rose-600 border border-rose-100',
  payment: 'bg-amber-50 text-amber-600 border border-amber-100',
  system: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
};


export default function NextAdminLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('Đã đánh dấu đọc tất cả thông báo');
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    setIsNotificationsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Đã xóa thông báo');
  };

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

  const { user } = useAuthStore();
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

  const renderSidebarContent = (mobile = false) => {
    // Lọc menu items dựa trên role của user
    const filteredMenuItems = menuItems.filter(item => {
      if (!item.requiredRoles) return true;
      if (!user?.roles) return false;
      return item.requiredRoles.some(role => user.roles.includes(role));
    });

    return (
      <div className="flex flex-col h-full bg-slate-900">
        <div className={cn(
          "h-16 flex items-center px-6 border-b border-slate-800 shrink-0",
          !isSidebarCollapsed || mobile ? "justify-start" : "justify-center"
        )}>
          <div className="relative h-9 w-9 mr-3 shrink-0 overflow-hidden rounded-lg border border-slate-700">
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
              "w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-medium rounded-lg transition-all",
              isSidebarCollapsed && !mobile ? "justify-center px-0" : "justify-start gap-3"
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
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <aside className={cn(
        "hidden lg:block transition-all duration-300 ease-in-out z-30 shadow-xl",
        isSidebarCollapsed ? "w-20" : "w-64"
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
              <SheetContent side="left" className="p-0 w-72 border-none [&>button]:text-white [&>button]:opacity-80 hover:[&>button]:opacity-100">
                {renderSidebarContent(true)}
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" className="hidden lg:flex text-slate-400 hover:text-slate-600" onClick={toggleSidebar}>
              <MenuIcon size={20} />
            </Button>

            <div className="hidden md:flex items-center px-4 py-2 rounded-lg w-72 bg-slate-100 border border-slate-200 focus-within:border-primary/50 focus-within:bg-white transition-all group">
              <Search size={16} className="mr-2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input placeholder="Tìm kiếm..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Dialog open={isScanOpen} onOpenChange={setIsScanOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                      <ScanBarcode size={20} />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Quét mã vạch</TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-slate-900">
                    <ScanBarcode className="text-primary h-5 w-5" />
                    Quét mã vạch & SKU
                  </DialogTitle>
                  <DialogDescription>
                    Mô phỏng máy quét mã vạch trực tiếp bằng Camera hoặc nhập mã tay.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <BarcodeScanner onClose={() => setIsScanOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>

            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Thông báo ({unreadCount})</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-80 sm:w-96 p-0 bg-white border border-slate-200 shadow-xl rounded-xl mr-2" align="end">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">Thông báo</h4>
                    {unreadCount > 0 && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-semibold text-[10px]">
                        {unreadCount} chưa đọc
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const Icon = notificationTypeIcons[notification.type] || Bell;
                      const iconColor = notificationTypeColors[notification.type] || 'bg-slate-100 text-slate-600';
                      
                      return (
                        <div 
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "flex items-start gap-3 p-3.5 hover:bg-slate-50/70 transition-all cursor-pointer relative group",
                            !notification.isRead && "bg-blue-50/20"
                          )}
                        >
                          {/* Unread indicator dot */}
                          {!notification.isRead && (
                            <span className="absolute right-3 top-4 h-2 w-2 bg-blue-500 rounded-full"></span>
                          )}

                          <div className={cn("p-2 rounded-lg shrink-0", iconColor)}>
                            <Icon size={16} />
                          </div>

                          <div className="space-y-1 min-w-0 flex-1 text-left">
                            <p className={cn(
                              "text-xs leading-snug text-slate-950",
                              !notification.isRead ? "font-bold" : "font-medium"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                              {notification.description}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {notification.time}
                            </p>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                            className="text-slate-300 hover:text-rose-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <div className="p-3 bg-slate-50 text-slate-300 rounded-full mb-3">
                        <Inbox size={28} />
                      </div>
                      <p className="text-xs font-bold text-slate-600">Không có thông báo mới</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Hệ thống vận hành của bạn hiện đang ở trạng thái tối ưu.</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center rounded-b-xl">
                    <Link 
                      href="/audit-logs" 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors inline-block w-full"
                    >
                      Xem tất cả nhật ký hệ thống
                    </Link>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
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
                <DropdownMenuItem onClick={() => {
                  router.push('/settings');
                  handleNavigate();
                }} className="cursor-pointer py-2 px-3">
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
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
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
