'use client';

import React from 'react';

export default function ProfileSecurityTab() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-6 space-y-4">
      <h3 className="text-sm font-bold text-zinc-900 pb-3 border-b border-zinc-100">
        Thay đổi mật khẩu
      </h3>

      <form className="space-y-3 max-w-sm">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-zinc-900 text-white font-medium text-xs rounded-lg hover:bg-zinc-800 transition-colors mt-2 cursor-pointer"
        >
          Cập nhật mật khẩu
        </button>
      </form>
    </div>
  );
}
