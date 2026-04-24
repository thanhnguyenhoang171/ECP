import { type FC, memo } from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: FC = memo(() => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[450px] transition-all duration-300">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
            <span className="text-3xl font-black text-white italic">E</span>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
});

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
