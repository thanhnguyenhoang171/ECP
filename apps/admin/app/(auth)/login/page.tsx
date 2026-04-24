"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, ArrowRight, Facebook } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("access_token", "fake_token_123");
      router.push("/dashboard");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           Đăng nhập hệ thống
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tên đăng nhập</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="admin"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
            <span className="text-slate-600">Ghi nhớ tôi</span>
          </label>
          <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
            Quên mật khẩu?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              Hoặc đăng nhập với
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.4-1.2 1.08-2.68 1.88-5.72 1.88-4.48 0-8.08-3.6-8.08-8.08s3.6-8.08 8.08-8.08c2.44 0 4.28.96 5.64 2.24l2.28-2.28C18.12 2.04 15.64.92 12.48.92 6.28.92 1.24 5.96 1.24 12.16s5.04 11.24 11.24 11.24c3.36 0 5.84-1.12 7.76-3.12 2-2 2.64-4.76 2.64-7.04 0-.48-.04-.96-.12-1.32h-10.28z"/>
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600">
            <Facebook className="text-[#1877F2]" size={20} />
            Facebook
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Chưa có quyền truy cập?{" "}
        <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline">
          Đăng ký tài khoản mới
        </Link>
      </p>
    </div>
  );
}
