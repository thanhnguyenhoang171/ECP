'use client';

import React from 'react';

export default function StorefrontError({ reset }: { reset: () => void }): React.JSX.Element {
  return <div className='mx-auto max-w-xl px-4 py-20 text-center space-y-4'>
    <h1 className='text-xl font-bold'>Chưa thể tải dữ liệu cửa hàng</h1>
    <p className='text-sm text-slate-500'>Vui lòng kiểm tra kết nối và thử lại sau.</p>
    <button type='button' onClick={reset} className='rounded-xl bg-blue-600 px-5 py-3 text-sm text-white'>Thử lại</button>
  </div>;
}
