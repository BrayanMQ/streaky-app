'use client';

import { useState, useEffect } from 'react';

/**
 * Type for the BeforeInstallPromptEvent
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Custom hook for handling PWA installation
 * 
 * This hook provides:
 * - Detection of whether the PWA is already installed
 * - State for whether the app can be installed
 * - Function to trigger the installation prompt
 * - Handling of the beforeinstallprompt event
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { usePWAInstall } from '@/hooks/usePWAInstall'
 * 
 * function InstallButton() {
 *   const { isInstallable, isInstalled, install } = usePWAInstall()
 *   
 *   if (isInstalled || !isInstallable) {
 *     return null
 *   }
 *   
 *   return (
 *     <button onClick={install}>
 *       Install App
 *     </button>
 *   )
 * }
 * ```
 */
export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    // In standalone mode (PWA installed), window.matchMedia('(display-mode: standalone)') returns true
    // Also check if running in standalone mode on iOS
    const checkIfInstalled = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true || // iOS
        document.referrer.includes('android-app://'); // Android
      
      setIsInstalled(isStandalone);
    };

    checkIfInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check installation status on focus (in case user installed via browser menu)
    const handleFocus = () => {
      checkIfInstalled();
    };
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  /**
   * Triggers the installation prompt
   * 
   * @returns Promise that resolves when installation is complete or dismissed
   */
  const install = async (): Promise<{ outcome: 'accepted' | 'dismissed' } | null> => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return null;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      // Clear the deferred prompt
      setDeferredPrompt(null);
      setIsInstallable(false);

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      return { outcome };
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return null;
    }
  };

  return {
    isInstallable,
    isInstalled,
    install,
  };
}

