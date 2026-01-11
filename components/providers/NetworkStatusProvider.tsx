'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/**
 * Network status context value
 */
interface NetworkStatusContextValue {
    /** Whether the browser is currently online */
    isOnline: boolean;
    /** Whether the network status has been detected */
    isInitialized: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextValue>({
    isOnline: true,
    isInitialized: false,
});

/**
 * Hook to access network status
 * 
 * @returns Network status context value
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline } = useNetworkStatus();
 *   
 *   if (!isOnline) {
 *     return <div>You're offline</div>;
 *   }
 *   
 *   return <div>Online content</div>;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatusContextValue {
    return useContext(NetworkStatusContext);
}

interface NetworkStatusProviderProps {
    children: ReactNode;
}

/**
 * NetworkStatusProvider Component
 * 
 * Monitors the browser's online/offline status and provides it to child components.
 * Also shows toast notifications when the connection status changes.
 * 
 * Features:
 * - Detects online/offline status changes
 * - Shows user-friendly toast notifications
 * - Provides useNetworkStatus hook for components
 * 
 * @example
 * ```tsx
 * // In your providers
 * <NetworkStatusProvider>
 *   <App />
 * </NetworkStatusProvider>
 * ```
 */
export function NetworkStatusProvider({ children }: NetworkStatusProviderProps) {
    const [isOnline, setIsOnline] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const { t } = useTranslation();

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        toast.success(t('errors.network.online'), {
            description: t('errors.network.onlineDesc'),
        });
    }, [t]);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        toast.error(t('errors.network.offline'), {
            description: t('errors.network.offlineDesc'),
        });
    }, [t]);

    useEffect(() => {
        // Set initial state based on navigator.onLine
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);
            setIsInitialized(true);

            // Add event listeners
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, [handleOnline, handleOffline]);

    return (
        <NetworkStatusContext.Provider value={{ isOnline, isInitialized }}>
            {children}
        </NetworkStatusContext.Provider>
    );
}
