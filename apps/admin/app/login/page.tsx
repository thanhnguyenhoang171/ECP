import React, { Suspense } from 'react';
import LoginView from '@/features/auth/components/LoginView';

export default function LoginPage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
