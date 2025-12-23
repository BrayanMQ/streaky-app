'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { getTodayDate, formatDate } from '@/lib/habits';
import { habitsKeys } from '@/hooks/useHabits';
import type { HabitLog, HabitLogInsert } from '@/types/database';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Query keys for React Query
 */
export const habitLogsKeys = {
  all: ['habit_logs'] as const,
  user: (userId: string | null) => ['habit_logs', 'user', userId] as const,
  habit: (habitId: string) => ['habit_logs', 'habit', habitId] as const,
  today: (habitId: string) => ['habit_logs', 'today', habitId] as const,
  userToday: (userId: string | null) => ['habit_logs', 'user', 'today', userId] as const,
};

/**
 * Custom hook for fetching and mutating habit logs using React Query
 * 
 * This hook provides:
 * - Fetch logs for a specific habit or all user habits
 * - Query for today's logs
 * - Mutation for toggling habit completion with optimistic updates
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useHabitLogs } from '@/hooks/useHabitLogs'
 * 
 * function HabitCard({ habitId }) {
 *   const { logs, isLoading } = useHabitLogs({ habitId })
 *   const { toggleCompletion, isToggling } = useHabitLogs({ habitId })
 *   
 *   const handleToggle = () => {
 *     toggleCompletion()
 *   }
 *   
 *   return <button onClick={handleToggle}>Toggle</button>
 * }
 * ```
 */
export function useHabitLogs(options?: {
  habitId?: string;
  includeTodayOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { habitId, includeTodayOnly = false } = options ?? {};

  // Query for habit logs
  const {
    data: logs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: habitId
      ? includeTodayOnly
        ? habitLogsKeys.today(habitId)
        : habitLogsKeys.habit(habitId)
      : habitLogsKeys.userToday(user?.id ?? null),
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const supabase = createBrowserClient();
      let query = supabase.from('habit_logs').select('*');

      if (habitId) {
        query = query.eq('habit_id', habitId);
      } else {
        // Get logs for all user habits
        // First get user's habits, then get logs for those habits
        const { data: userHabits, error: habitsError } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', user.id);

        if (habitsError) {
          throw habitsError;
        }

        if (!userHabits || userHabits.length === 0) {
          return [];
        }

        const habitIds = userHabits.map((h) => h.id);
        query = query.in('habit_id', habitIds);
      }

      if (includeTodayOnly) {
        const today = getTodayDate();
        query = query.eq('date', today);
      }

      const { data, error: queryError } = await query.order('date', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      return (data as HabitLog[]) ?? [];
    },
    enabled: !!user?.id && (habitId ? true : true), // Only run query if user is authenticated
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });

  // Mutation for toggling habit completion
  const toggleMutation = useMutation({
    mutationFn: async (params: { habitId: string; completed: boolean; date?: string }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      const supabase = createBrowserClient();
      const targetDate = params.date ?? getTodayDate();

      // Check if log exists for this date
      const { data: existingLog, error: checkError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', params.habitId)
        .eq('date', targetDate)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if log doesn't exist
        throw checkError;
      }

      if (existingLog) {
        // Update existing log
        const { data, error: updateError } = await supabase
          .from('habit_logs')
          .update({ completed: params.completed })
          .eq('id', existingLog.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return data as HabitLog;
      } else {
        // Insert new log
        const newLog: HabitLogInsert = {
          habit_id: params.habitId,
          date: targetDate,
          completed: params.completed,
        };

        const { data, error: insertError } = await supabase
          .from('habit_logs')
          .insert(newLog)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return data as HabitLog;
      }
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: habitLogsKeys.habit(params.habitId),
      });
      await queryClient.cancelQueries({
        queryKey: habitLogsKeys.today(params.habitId),
      });
      await queryClient.cancelQueries({
        queryKey: habitLogsKeys.userToday(user?.id ?? null),
      });

      // Snapshot previous values
      const previousLogs = queryClient.getQueryData<HabitLog[]>(
        habitLogsKeys.habit(params.habitId)
      );
      const previousTodayLogs = queryClient.getQueryData<HabitLog[]>(
        habitLogsKeys.today(params.habitId)
      );
      const previousUserTodayLogs = queryClient.getQueryData<HabitLog[]>(
        habitLogsKeys.userToday(user?.id ?? null)
      );

      const targetDate = params.date ?? getTodayDate();

      // Optimistically update logs
      const optimisticLog: HabitLog = {
        id: `temp-${Date.now()}`,
        habit_id: params.habitId,
        date: targetDate,
        completed: params.completed,
      };

      // Update habit logs query
      if (previousLogs) {
        const existingIndex = previousLogs.findIndex(
          (log) => log.habit_id === params.habitId && formatDate(log.date) === targetDate
        );
        if (existingIndex >= 0) {
          const updated = [...previousLogs];
          updated[existingIndex] = optimisticLog;
          queryClient.setQueryData(habitLogsKeys.habit(params.habitId), updated);
        } else {
          queryClient.setQueryData(habitLogsKeys.habit(params.habitId), [
            optimisticLog,
            ...previousLogs,
          ]);
        }
      }

      // Update today logs query
      if (previousTodayLogs) {
        const existingIndex = previousTodayLogs.findIndex(
          (log) => log.habit_id === params.habitId && formatDate(log.date) === targetDate
        );
        if (existingIndex >= 0) {
          const updated = [...previousTodayLogs];
          updated[existingIndex] = optimisticLog;
          queryClient.setQueryData(habitLogsKeys.today(params.habitId), updated);
        } else {
          queryClient.setQueryData(habitLogsKeys.today(params.habitId), [
            optimisticLog,
            ...previousTodayLogs,
          ]);
        }
      }

      // Update user today logs query
      if (previousUserTodayLogs) {
        const existingIndex = previousUserTodayLogs.findIndex(
          (log) => log.habit_id === params.habitId && formatDate(log.date) === targetDate
        );
        if (existingIndex >= 0) {
          const updated = [...previousUserTodayLogs];
          updated[existingIndex] = optimisticLog;
          queryClient.setQueryData(habitLogsKeys.userToday(user?.id ?? null), updated);
        } else {
          queryClient.setQueryData(habitLogsKeys.userToday(user?.id ?? null), [
            optimisticLog,
            ...previousUserTodayLogs,
          ]);
        }
      }

      return {
        previousLogs,
        previousTodayLogs,
        previousUserTodayLogs,
      };
    },
    onError: (err, params, context) => {
      // Rollback on error
      if (context?.previousLogs) {
        queryClient.setQueryData(habitLogsKeys.habit(params.habitId), context.previousLogs);
      }
      if (context?.previousTodayLogs) {
        queryClient.setQueryData(habitLogsKeys.today(params.habitId), context.previousTodayLogs);
      }
      if (context?.previousUserTodayLogs) {
        queryClient.setQueryData(
          habitLogsKeys.userToday(user?.id ?? null),
          context.previousUserTodayLogs
        );
      }
    },
    onSettled: (data, error, params) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: habitLogsKeys.habit(params.habitId),
      });
      queryClient.invalidateQueries({
        queryKey: habitLogsKeys.today(params.habitId),
      });
      queryClient.invalidateQueries({
        queryKey: habitLogsKeys.userToday(user?.id ?? null),
      });
      // Also invalidate habits to refresh streak calculations
      queryClient.invalidateQueries({
        queryKey: habitsKeys.user(user?.id ?? null),
      });
    },
  });

  // Invalidate logs query when auth state changes
  useEffect(() => {
    if (!user?.id) {
      // Clear logs cache when user logs out
      queryClient.setQueryData(habitLogsKeys.userToday(null), []);
      queryClient.removeQueries({ queryKey: habitLogsKeys.all });
    } else {
      // Invalidate logs when user changes (login)
      queryClient.invalidateQueries({ queryKey: habitLogsKeys.user(user.id) });
      queryClient.invalidateQueries({ queryKey: habitLogsKeys.userToday(user.id) });
    }
  }, [user?.id, queryClient]);

  /**
   * Toggle completion for a habit on a specific date (defaults to today)
   */
  const toggleCompletion = async (params: {
    habitId: string;
    date?: string;
    completed?: boolean;
  }) => {
    if (!habitId && !params.habitId) {
      throw new Error('habitId is required');
    }

    const targetHabitId = params.habitId ?? habitId!;
    const targetDate = params.date ?? getTodayDate();

    // Get current log to determine toggle state
    const currentLogs = queryClient.getQueryData<HabitLog[]>(
      habitLogsKeys.habit(targetHabitId)
    );
    const todayLog = currentLogs?.find((log) => formatDate(log.date) === targetDate);
    const currentCompleted = todayLog?.completed ?? false;

    // Toggle: if currently completed, set to false, otherwise set to true
    const newCompleted = params.completed ?? !currentCompleted;

    return toggleMutation.mutateAsync({
      habitId: targetHabitId,
      completed: newCompleted,
      date: targetDate,
    });
  };

  return {
    logs: logs ?? [],
    isLoading,
    error: error as PostgrestError | null,
    refetch,
    toggleCompletion,
    isToggling: toggleMutation.isPending,
    toggleError: toggleMutation.error as PostgrestError | null,
  };
}

