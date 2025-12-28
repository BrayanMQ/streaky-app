'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import type { Habit, HabitInsert } from '@/types/database';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Json } from '@/types/database';

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

/**
 * Custom hook for creating a new habit using React Query
 * 
 * This hook provides a mutation for creating habits with automatic cache invalidation.
 * It includes error handling and loading states.
 * 
 * @returns Object containing:
 *   - createHabit: Function to create a new habit
 *   - isCreating: Loading state of the mutation
 *   - createError: Error object if mutation failed
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useCreateHabit } from '@/hooks/useHabits'
 * 
 * function CreateHabitForm() {
 *   const { createHabit, isCreating, createError } = useCreateHabit()
 *   
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault()
 *     try {
 *       await createHabit({
 *         title: 'Morning Exercise',
 *         color: 'bg-blue-500',
 *         icon: '🏋️'
 *       })
 *       // Success - modal will close and list will refresh automatically
 *     } catch (error) {
 *       console.error('Failed to create habit:', error)
 *     }
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {/* form fields */
/* *       <button disabled={isCreating}>
*         {isCreating ? 'Creating...' : 'Create Habit'}
*       </button>
*       {createError && <p>Error: {createError.message}</p>}
*     </form>
*   )
* }
* ```
*/
export function useCreateHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Mutation for creating a new habit
  const createMutation = useMutation({
    mutationFn: async (params: {
      title: string;
      color?: string | null;
      icon?: string | null;
      frequency?: Json | null;
    }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      // Validate title
      if (!params.title || params.title.trim().length === 0) {
        throw new Error('Habit title is required');
      }

      const supabase = createBrowserClient();

      // Prepare habit data
      const newHabit: HabitInsert = {
        user_id: user.id,
        title: params.title.trim(),
        color: params.color || null,
        icon: params.icon || null,
        frequency: params.frequency || null, // Default to null (daily in MVP)
      };

      // Insert habit
      const { data, error: insertError } = await supabase
        .from('habits')
        .insert(newHabit)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return data as Habit;
    },
    onSuccess: () => {
      // Invalidate habits query to refresh the list
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: habitsKeys.user(user.id),
        });
        // Also invalidate the general habits query
        queryClient.invalidateQueries({
          queryKey: habitsKeys.all,
        });
      }
    },
  });

  return {
    createHabit: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as PostgrestError | null,
  };
}

