'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import type { Habit } from '@/types/database';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Query keys for React Query
 */
export const habitsKeys = {
  all: ['habits'] as const,
  user: (userId: string | null) => ['habits', userId] as const,
};

/**
 * Custom hook for fetching user habits using React Query
 * 
 * This hook provides:
 * - List of habits for the authenticated user
 * - Automatic refetching when auth state changes
 * - Loading and error states
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useHabits } from '@/hooks/useHabits'
 * 
 * function HabitsList() {
 *   const { habits, isLoading, error } = useHabits()
 *   
 *   if (isLoading) return <div>Loading habits...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   
 *   return (
 *     <ul>
 *       {habits?.map(habit => (
 *         <li key={habit.id}>{habit.title}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useHabits() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query for user habits
  const {
    data: habits,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: habitsKeys.user(user?.id ?? null),
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const supabase = createBrowserClient();
      const { data, error: queryError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      return (data as Habit[]) ?? [];
    },
    enabled: !!user?.id, // Only run query if user is authenticated
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });

  // Invalidate habits query when auth state changes
  useEffect(() => {
    if (!user?.id) {
      // Clear habits cache when user logs out
      queryClient.setQueryData(habitsKeys.user(null), []);
      queryClient.removeQueries({ queryKey: habitsKeys.all });
    } else {
      // Invalidate habits when user changes (login)
      queryClient.invalidateQueries({ queryKey: habitsKeys.user(user.id) });
    }
  }, [user?.id, queryClient]);

  return {
    habits: habits ?? [],
    isLoading,
    error: error as PostgrestError | null,
    refetch,
  };
}

