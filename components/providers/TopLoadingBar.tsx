'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';

/**
 * TopLoadingBar component
 * 
 * Displays a top loading bar during page navigations in Next.js App Router.
 * Uses nprogress library to show a progress indicator at the top of the page.
 * 
 * This component detects route changes using the usePathname hook and
 * manages nprogress start/complete lifecycle.
 */
export function TopLoadingBar() {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Configure nprogress on mount
    NProgress.configure({
      showSpinner: false,
      minimum: 0.08,
      easing: 'ease',
      speed: 200,
      trickleSpeed: 200,
    });
  }, []);

  useEffect(() => {
    // Skip on initial mount to avoid showing bar on page load
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Start the progress bar when pathname changes
    NProgress.start();

    // Complete the progress bar after a delay
    // In App Router, navigations are typically fast, so a short timeout works well
    const timer = setTimeout(() => {
      NProgress.done();
    }, 200);

    // Cleanup: ensure progress bar is done if component unmounts
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      NProgress.done();
    };
  }, []);

  return null;
}

