'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NextProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('access_token')) router.replace('/login');
    else setAuthorized(true);
  }, [router]);
  return authorized ? <>{children}</> : null;
}
