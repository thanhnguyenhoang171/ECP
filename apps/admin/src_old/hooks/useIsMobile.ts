import { useState, useEffect, useCallback } from 'react';

/**
 * Hook kiểm tra responsive mobile/desktop.
 * Dùng thay cho window.innerWidth trực tiếp trong render body,
 * tránh force layout recalculation mỗi lần render.
 */
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < breakpoint);
  }, [breakpoint]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return isMobile;
};
