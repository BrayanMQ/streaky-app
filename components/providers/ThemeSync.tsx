'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUserSettings } from '@/hooks/useUserSettings';

/**
 * ThemeSync component
 * 
 * This component synchronizes the theme from the database with next-themes.
 * It runs once when settings are loaded to ensure the theme from DB is applied.
 * 
 * This is a separate component to avoid circular dependencies and ensure
 * it only runs when needed (inside ThemeProvider context).
 */
export function ThemeSync() {
  const { settings } = useUserSettings();
  const { theme: currentTheme, setTheme, systemTheme } = useTheme();

  useEffect(() => {
    // Only sync when settings are loaded and user is authenticated
    if (!settings?.theme) {
      return;
    }

    // If the theme from DB is different from current theme, sync it
    // This handles initial load when user logs in
    if (settings.theme !== currentTheme && currentTheme !== undefined) {
      setTheme(settings.theme);
    }
  }, [settings?.theme]); // Only depend on settings.theme to run once when loaded

  // This component doesn't render anything
  return null;
}

