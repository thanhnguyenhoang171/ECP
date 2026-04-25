'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NextProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      if (!localStorage.getItem('access_token')) {
        router.replace('/login');
      } else {
        setAuthorized(true);
      }
    };
    
    // Sử dụng setTimeout 0 để tránh cảnh báo setState đồng bộ trong effect của React 19
    const timer = setTimeout(checkAuth, 0);
    return () => clearTimeout(timer);
  }, [router]);

  return authorized ? <>{children}</> : null;
}
