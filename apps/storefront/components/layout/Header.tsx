'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  Menu, 
  X, 
  Phone, 
  ChevronDown,
  ShieldCheck,
  Truck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { logoutClient } from '@/services/auth.service';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartItemCount = 3;

  const { user, isAuthenticated, isLoading, clearAuth } = useAuthStore();
  const displayName = (user?.lastName || user?.firstName)
    ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
    : ((user as any)?.fullName || user?.username || user?.email || 'User');
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems.length;
  const router = useRouter();

  const handleLogout = async () => {
    await logoutClient();
    clearAuth();
    toast.success('Đã đăng xuất thành công!');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#191715]/95 backdrop-blur-md border-b border-amber-950/50 text-zinc-300 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#13110e] text-zinc-400 text-xs py-2 px-4 border-b border-amber-950/40 font-medium">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 font-normal text-zinc-300">
              <Truck className="w-3.5 h-3.5 text-[#f5c542]" /> Miễn phí giao hàng cho đơn từ 500.000đ
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#f5c542]" /> Cam kết 100% chính hãng
            </span>
          </div>
          <div className="flex items-center space-x-4 text-zinc-400">
            <a href="tel:19001234" className="flex items-center gap-1 hover:text-[#f5c542] transition-colors">
              <Phone className="w-3 h-3 text-[#f5c542]" /> 1900 1234
            </a>
            <span className="h-3 w-px bg-zinc-800 hidden sm:block"></span>
            <Link href="/profile" className="hidden sm:block hover:text-[#f5c542] transition-colors">
              Tra cứu đơn hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-[#f5c542] flex items-center justify-center shadow-sm overflow-hidden"
            >
              <Image
                src="/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg"
                alt="Cacao Thai Snack Shop Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              Cacao Thai Snack Shop
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <form 
              onSubmit={(e) => { e.preventDefault(); console.log('Search:', searchQuery); }}
              className="w-full relative flex items-center"
            >
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2 bg-[#282420] border border-zinc-700/80 hover:border-zinc-500 rounded-lg text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:bg-[#2e2924] focus:border-[#f5c542] focus:ring-1 focus:ring-[#f5c542] transition-all"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-2 text-zinc-400 hover:text-[#f5c542] transition-colors p-1"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/wishlist"
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 rounded-lg transition-colors relative inline-flex items-center justify-center"
                title="Sản phẩm yêu thích"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-[#191715] shadow-xs animate-bounce">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </motion.div>

            {/* Cart Icon */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/cart"
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition-colors relative inline-flex items-center justify-center"
                title="Giỏ hàng"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F5C542] text-[#1E1B18] text-[9px] font-extrabold rounded-full flex items-center justify-center border border-[#191715] shadow-xs">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </motion.div>

            {/* User Profile — Radix UI Dropdown Menu */}
            <div>
              {isLoading ? (
                <div className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-lg border border-zinc-800 animate-pulse">
                  <div className="w-4 h-4 bg-zinc-800 rounded" />
                  <div className="hidden lg:block w-14 h-3 bg-zinc-800 rounded" />
                </div>
              ) : isAuthenticated && user ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className="flex items-center gap-1.5 p-1.5 pr-2.5 text-zinc-300 hover:bg-zinc-800/60 rounded-lg transition-colors border border-zinc-800 text-xs font-medium cursor-pointer outline-none"
                    >
                      {user?.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={displayName}
                          width={20}
                          height={20}
                          unoptimized
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#F5C542] flex items-center justify-center text-[#1E1B18] font-bold text-[10px]">
                          {avatarInitial}
                        </div>
                      )}
                      <span className="hidden lg:inline-block max-w-[200px] truncate">{displayName}</span>
                      <ChevronDown className="w-3 h-3 text-zinc-500 hidden lg:inline-block" />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      asChild
                      sideOffset={8}
                      align="end"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-48 bg-[#1e1b18] rounded-xl shadow-2xl border border-zinc-800 py-1.5 z-50 outline-none"
                      >
                        <div className="px-3.5 py-2 border-b border-zinc-800/80 mb-1">
                          <p className="text-[11px] font-semibold text-zinc-100 truncate">{displayName}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{user?.email || ''}</p>
                        </div>

                        <DropdownMenu.Item asChild>
                          <Link
                            href="/profile"
                            className="block px-3.5 py-2 text-xs text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100 transition-colors outline-none cursor-pointer"
                          >
                            Trang cá nhân
                          </Link>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item asChild>
                          <Link
                            href="/profile?tab=orders"
                            className="block px-3.5 py-2 text-xs text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100 transition-colors outline-none cursor-pointer"
                          >
                            Quản lý đơn hàng
                          </Link>
                        </DropdownMenu.Item>

                        <div className="my-1 border-t border-zinc-800/80"></div>

                        <DropdownMenu.Item asChild>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/30 transition-colors font-medium outline-none cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Đăng xuất
                          </button>
                        </DropdownMenu.Item>
                      </motion.div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 p-1.5 pr-2.5 text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100 rounded-lg transition-colors border border-zinc-800 text-xs font-medium"
                >
                  <LogIn className="w-4 h-4 text-zinc-400" />
                  <span className="hidden lg:inline-block">Đăng nhập</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-400 hover:bg-zinc-800/60 rounded-lg md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-zinc-300" /> : <Menu className="w-5 h-5 text-zinc-300" />}
            </button>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="hidden md:flex items-center space-x-6 py-2.5 text-xs font-medium border-t border-zinc-800/60">
          <Link href="/" className="text-zinc-100 font-semibold hover:text-[#f5c542] transition-colors">
            Trang chủ
          </Link>
          <Link href="/products" className="text-zinc-400 hover:text-zinc-100 transition-colors">
            Tất cả sản phẩm
          </Link>
          <Link href="/categories" className="text-[#f5c542] font-semibold hover:text-amber-300 transition-colors">
            Tất cả danh mục
          </Link>
          <Link href="/categories/snack-candies" className="text-zinc-400 hover:text-zinc-100 transition-colors">
            Snack & Bánh kẹo
          </Link>
          <Link href="/categories/beverages" className="text-zinc-400 hover:text-zinc-100 transition-colors">
            Nước giải khát & Trà sữa
          </Link>
          <Link href="/categories/instant-foods" className="text-zinc-400 hover:text-zinc-100 transition-colors">
            Đồ ăn vặt & Mì ăn liền
          </Link>
          <Link href="/promotions" className="text-[#f5c542] font-semibold hover:text-amber-300 transition-colors">
            Khuyến mãi đặc biệt
          </Link>
        </nav>
      </div>

      {/* Mobile Menu with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#191715] border-b border-amber-950/50 px-4 pt-3 pb-5 space-y-3 overflow-hidden"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-3 pr-8 py-2 bg-[#282420] border border-zinc-700/80 hover:border-zinc-500 rounded-lg text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:bg-[#2e2924] focus:border-[#f5c542] focus:ring-1 focus:ring-[#f5c542] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex flex-col space-y-2.5 text-xs font-medium text-zinc-300">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-100 font-semibold hover:text-[#f5c542]">
                Trang chủ
              </Link>
              <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-zinc-100">
                Tất cả sản phẩm
              </Link>
              <Link href="/categories/snack-candies" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-zinc-100">
                Snack & Bánh kẹo
              </Link>
              <Link href="/categories/beverages" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-zinc-100">
                Nước giải khát & Trà sữa
              </Link>
              <Link href="/categories/instant-foods" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-zinc-100">
                Đồ ăn vặt & Mì ăn liền
              </Link>
              <Link href="/promotions" onClick={() => setIsMobileMenuOpen(false)} className="text-[#f5c542] font-semibold">
                Khuyến mãi đặc biệt
              </Link>
              <div className="pt-2 border-t border-zinc-800"></div>
              {isAuthenticated && user ? (
                <>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-300">
                    Trang cá nhân ({displayName})
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-1.5 text-red-400 font-semibold text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-100 font-semibold hover:text-[#f5c542]">
                  Đăng nhập / Đăng ký
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
