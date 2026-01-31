'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Type for user settings
 */
export type UserSettings = {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  created_at: string;
  updated_at: string;
};

/**
 * Query keys for React Query
 */
export const userSettingsKeys = {
  all: ['user_settings'] as const,
  user: (userId: string | null) => ['user_settings', userId] as const,
};

/**
 * Custom hook for managing user settings using React Query
 * 
 * This hook provides:
 * - User settings data (theme preferences, etc.)
 * - Mutation to update theme preference
 * - Automatic synchronization with next-themes
 * - Auto-creation of settings record if it doesn't exist
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useUserSettings } from '@/hooks/useUserSettings'
 * 
 * function ThemeToggle() {
 *   const { settings, updateTheme, isUpdating } = useUserSettings()
 *   
 *   return (
 *     <button onClick={() => updateTheme('dark')} disabled={isUpdating}>
 *       {settings?.theme || 'system'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useUserSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { theme: currentTheme, setTheme: setNextTheme, resolvedTheme } = useTheme();

  // Query for user settings
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: userSettingsKeys.user(user?.id ?? null),
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      const supabase = createBrowserClient();

      // Try to fetch existing settings
      const { data, error: queryError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If settings don't exist, create them with default values
      if (queryError && queryError.code === 'PGRST116') {
        // No rows returned, create new settings
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            theme: 'system',
            language: 'en',
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return newSettings as UserSettings;
      }

      if (queryError) {
        throw queryError;
      }

      return (data as UserSettings) ?? null;
    },
    enabled: !!user?.id, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mutation to update theme
  const updateThemeMutation = useMutation({
    mutationFn: async (theme: 'light' | 'dark' | 'system') => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      const supabase = createBrowserClient();

      // Update theme in database
      const { data, error: updateError } = await supabase
        .from('user_settings')
        .update({ theme })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return data as UserSettings;
    },
    onSuccess: (data) => {
      // Update cache with new settings
      queryClient.setQueryData(userSettingsKeys.user(user?.id ?? null), data);

      // Synchronize with next-themes
      setNextTheme(data.theme);
    },
  });

  // Mutation to update language
  const updateLanguageMutation = useMutation({
    mutationFn: async (language: string) => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      const supabase = createBrowserClient();

      // Update language in database
      const { data, error: updateError } = await supabase
        .from('user_settings')
        .update({ language })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return data as UserSettings;
    },
    onSuccess: (data) => {
      // Update cache with new settings
      queryClient.setQueryData(userSettingsKeys.user(user?.id ?? null), data);
    },
  });

  // Sync theme from database to next-themes when settings load
  // This effect ensures next-themes is synchronized with the database theme
  useEffect(() => {
    if (!settings?.theme || currentTheme === undefined) {
      // Don't sync if settings aren't loaded or theme is still mounting
      return;
    }

    // Only sync if DB theme differs from current next-themes theme
    // This prevents infinite loops while ensuring DB state takes precedence
    if (settings.theme !== currentTheme) {
      setNextTheme(settings.theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.theme, currentTheme]); // Include currentTheme to detect when it changes

  // Sync language from database to i18next when settings load
  // This effect ensures i18next is synchronized with the database language
  // Runs on login and whenever settings change
  useEffect(() => {
    if (!settings?.language || !user?.id) {
      // Don't sync if settings aren't loaded or user isn't authenticated
      return;
    }

    // Import i18n dynamically to avoid circular dependencies
    import('@/i18n').then((i18nModule) => {
      const i18n = i18nModule.default;

      // Always sync language from database when settings load
      // This ensures language is restored on login
      const currentLang = (i18n.language || 'en').split('-')[0];

      if (settings.language !== currentLang) {
        console.log(`[useUserSettings] Syncing language from DB: ${settings.language}`);
        i18n.changeLanguage(settings.language);
      }
    }).catch((error) => {
      console.error('[useUserSettings] Failed to sync language:', error);
    });
  }, [settings?.language, user?.id]);

  // Invalidate settings query when auth state changes
  useEffect(() => {
    if (!user?.id) {
      // Clear settings cache when user logs out
      queryClient.setQueryData(userSettingsKeys.user(null), null);
    } else {
      // Invalidate settings when user changes (login)
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.user(user.id) });
    }
  }, [user?.id, queryClient]);

  return {
    settings: settings ?? null,
    isLoading,
    error: error as PostgrestError | null,
    updateTheme: updateThemeMutation.mutateAsync,
    isUpdating: updateThemeMutation.isPending,
    updateError: updateThemeMutation.error as PostgrestError | null,
    updateLanguage: updateLanguageMutation.mutateAsync,
    isUpdatingLanguage: updateLanguageMutation.isPending,
    updateLanguageError: updateLanguageMutation.error as PostgrestError | null,
  };
}

