import { type FC, memo } from 'react';
import { Outlet } from 'react-router-dom';
import { BackButton } from '../common';

const ProfileLayout: FC = memo(() => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
      <div className="absolute top-6 left-6">
        <BackButton label="Quay lại Dashboard" destination="/dashboard" />
      </div>
      
      <div className="w-full max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
});

ProfileLayout.displayName = 'ProfileLayout';

export default ProfileLayout;
