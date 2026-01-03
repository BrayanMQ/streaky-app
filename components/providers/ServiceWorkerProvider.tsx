'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerProvider
 * 
 * Registers the service worker to enable PWA offline functionality.
 * Handles installation, updates, and errors of the service worker.
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {

    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SW] Service Worker not enabled in development');
      return;
    }

    // Only run on client
    if (typeof window === 'undefined') {
      return;
    }

    // Check browser support
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service Worker not supported in this browser');
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Service Worker registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Every minute

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('[SW] New version available');
              // Optional: show notification to user
              // For now we just force reload on next interaction
              if (confirm('A new version is available. Reload now?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('[SW] Error registering Service Worker:', error);
      });

    // Listen to messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        window.location.reload();
      }
    });

    // Handle when service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] New service worker active');
    });
  }, []);

  return <>{children}</>;
}

