'use client';

import { useCallback } from 'react';
import NProgress from 'nprogress';

/**
 * Hook to control the top loading bar manually
 * 
 * Use this hook to start/stop the loading bar programmatically,
 * for example when clicking navigation links.
 * 
 * @example
 * ```tsx
 * const { startLoading, finishLoading } = useTopLoadingBar();
 * 
 * const handleClick = () => {
 *   startLoading();
 *   router.push('/dashboard');
 * };
 * ```
 */
export function useTopLoadingBar() {
  const startLoading = useCallback(() => {
    NProgress.start();
  }, []);

  const finishLoading = useCallback(() => {
    NProgress.done();
  }, []);

  return {
    startLoading,
    finishLoading,
  };
}

