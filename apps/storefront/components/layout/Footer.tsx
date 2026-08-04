'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  MessageCircle, 
  Share2, 
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Headphones
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#191715] text-zinc-400 pt-14 pb-8 border-t border-amber-950/50 text-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-zinc-800">
          <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <CreditCard className="w-5 h-5 text-[#f5c542] shrink-0" />
            <div>
              <h4 className="font-medium text-zinc-100">Thanh toán an toàn</h4>
              <p className="text-[11px] text-zinc-500">Hỗ trợ VNPAY, Momo, VISA</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <ShieldCheck className="w-5 h-5 text-zinc-300 shrink-0" />
            <div>
              <h4 className="font-medium text-zinc-100">100% Chính hãng</h4>
              <p className="text-[11px] text-zinc-500">Cam kết chất lượng chuẩn</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <RefreshCw className="w-5 h-5 text-zinc-300 shrink-0" />
            <div>
              <h4 className="font-medium text-zinc-100">Đổi trả 30 ngày</h4>
              <p className="text-[11px] text-zinc-500">Thủ tục đơn giản, nhanh chóng</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <Headphones className="w-5 h-5 text-zinc-300 shrink-0" />
            <div>
              <h4 className="font-medium text-zinc-100">Hỗ trợ 24/7</h4>
              <p className="text-[11px] text-zinc-500">Tư vấn tận tâm, chu đáo</p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="my-10 p-6 rounded-2xl bg-[#1e293b] border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Nhận thông báo ưu đãi sản phẩm mới
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Đăng ký email để nhận mã giảm giá 10% cho đơn hàng đầu tiên.
            </p>
          </div>
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="w-full md:w-auto flex items-center max-w-md gap-2"
          >
            <input
              type="email"
              placeholder="Địa chỉ email của bạn..."
              className="w-full px-3.5 py-2 bg-[#282420] border border-zinc-700/80 hover:border-zinc-500 rounded-lg text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:bg-[#2e2924] focus:border-[#f5c542] focus:ring-1 focus:ring-[#f5c542] transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#F5C542] hover:bg-[#e5b32e] text-[#1e1b18] font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-sm border border-amber-500/40"
            >
              Đăng ký
            </button>
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-6">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f5c542] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                <Image
                  src="/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg"
                  alt="Cacao Thai Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-bold text-zinc-100 tracking-tight">Cacao Thai Snack Shop</span>
            </Link>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Chuyên cung cấp các loại đồ ăn vặt, snack giòn rụm, trà sữa và nước giải khát Thái Lan chính hãng nhập khẩu.
            </p>
            <div className="flex space-x-2 text-zinc-400 pt-1">
              <a href="#" className="p-1.5 bg-zinc-900 rounded hover:text-white transition-colors" title="Website">
                <Globe className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="p-1.5 bg-zinc-900 rounded hover:text-white transition-colors" title="Hỗ trợ">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="p-1.5 bg-zinc-900 rounded hover:text-white transition-colors" title="Chia sẻ">
                <Share2 className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Khám phá</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/products" className="hover:text-zinc-200 transition-colors">Tất cả sản phẩm</Link></li>
              <li><Link href="/categories/snack-candies" className="hover:text-zinc-200 transition-colors">Snack & Bánh kẹo Thái</Link></li>
              <li><Link href="/categories/beverages" className="hover:text-zinc-200 transition-colors">Nước giải khát & Trà sữa</Link></li>
              <li><Link href="/categories/instant-foods" className="hover:text-zinc-200 transition-colors">Đồ ăn vặt & Mì ăn liền</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/help/shipping" className="hover:text-zinc-200 transition-colors">Chính sách giao hàng</Link></li>
              <li><Link href="/help/return" className="hover:text-zinc-200 transition-colors">Chính sách đổi trả 30 ngày</Link></li>
              <li><Link href="/help/warranty" className="hover:text-zinc-200 transition-colors">Bảo hành & Sửa chữa</Link></li>
              <li><Link href="/help/terms" className="hover:text-zinc-200 transition-colors">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Liên hệ</h4>
            <ul className="space-y-2.5 text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>Tòa nhà ECP, Phố Công Nghệ, Cầu Giấy, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>1900 1234 (8:00 - 21:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>support@cacaothaisnack.vn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 mt-6 border-t border-zinc-900 text-center text-[11px] text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Cacao Thai Snack Shop. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-3 text-zinc-500">
            <span className="hover:text-zinc-300 cursor-pointer">Chính sách bảo mật</span>
            <span>•</span>
            <span className="hover:text-zinc-300 cursor-pointer">Bảo mật thanh toán</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
