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
  };
}

