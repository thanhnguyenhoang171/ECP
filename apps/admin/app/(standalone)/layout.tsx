import React from 'react';

export interface StandaloneLayoutProps {
  readonly children: React.ReactNode;
}

const StandaloneLayout = ({
  children,
}: StandaloneLayoutProps): React.JSX.Element => {
  return (
    <div className='h-dvh w-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100/50 custom-scrollbar overscroll-y-contain'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
        {children}
      </div>
    </div>
  );
};

export default StandaloneLayout;
