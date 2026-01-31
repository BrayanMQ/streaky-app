'use client';

import { useEffect } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import i18n from '@/i18n';

/**
 * LanguageSync component
 * 
 * This component synchronizes the language from the database with i18next.
 * It runs once when settings are loaded to ensure the language from DB is applied.
 * 
 * This is a separate component to ensure it runs at the app level and syncs
 * language immediately when the user logs in.
 */
export function LanguageSync() {
    const { settings } = useUserSettings();

    useEffect(() => {
        // Only sync when settings are loaded and user is authenticated
        if (!settings?.language) {
            return;
        }

        // Get current language (normalize to base code)
        const currentLang = (i18n.language || 'en').split('-')[0];

        // If the language from DB is different from current language, sync it
        // This handles initial load when user logs in
        if (settings.language !== currentLang) {
            console.log(`[LanguageSync] Syncing language from DB: ${settings.language}`);
            i18n.changeLanguage(settings.language);
        }
    }, [settings?.language]); // Only depend on settings.language to run once when loaded

    // This component doesn't render anything
    return null;
}
