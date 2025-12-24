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
  habitRange: (habitId: string, startDate: string, endDate: string) =>
    ['habit_logs', 'habit', habitId, 'range', startDate, endDate] as const,
  userRange: (userId: string | null, startDate: string, endDate: string) =>
    ['habit_logs', 'user', userId, 'range', startDate, endDate] as const,
};

/**
 * Custom hook for fetching and mutating habit logs using React Query
 * 
 * This hook provides:
 * - Fetch logs for a specific habit or all user habits
 * - Query for today's logs
 * - Query for logs within a date range (startDate, endDate)
 * - Mutation for toggling habit completion with optimistic updates
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useHabitLogs } from '@/hooks/useHabitLogs'
 * 
 * function HabitCard({ habitId }) {
 *   // Get all logs for a habit
 *   const { logs, isLoading } = useHabitLogs({ habitId })
 *   
 *   // Get logs for a date range
 *   const { logs: rangeLogs } = useHabitLogs({ 
 *     habitId, 
 *     startDate: '2025-01-01', 
 *     endDate: '2025-01-31' 
 *   })
 *   
 *   const { toggleCompletion, isToggling } = useHabitLogs({ habitId })
 *   
 *   const handleToggle = () => {
 *     toggleCompletion({ habitId })
 *   }
 *   
 *   return <button onClick={handleToggle}>Toggle</button>
 * }
 * ```
 */
export function useHabitLogs(options?: {
  habitId?: string;
  includeTodayOnly?: boolean;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string;   // YYYY-MM-DD format
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { habitId, includeTodayOnly = false, startDate, endDate } = options ?? {};

  // Validate date range if both dates are provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Dates must be in YYYY-MM-DD format.');
    }
    if (start > end) {
      throw new Error('startDate must be less than or equal to endDate.');
    }
  }

  // Normalize dates to YYYY-MM-DD format
  const normalizedStartDate = startDate ? formatDate(startDate) : undefined;
  const normalizedEndDate = endDate ? formatDate(endDate) : undefined;

  // Determine query key based on options
  const getQueryKey = () => {
    if (habitId) {
      if (includeTodayOnly) {
        return habitLogsKeys.today(habitId);
      }
      if (normalizedStartDate && normalizedEndDate) {
        return habitLogsKeys.habitRange(habitId, normalizedStartDate, normalizedEndDate);
      }
      return habitLogsKeys.habit(habitId);
    } else {
      if (includeTodayOnly) {
        return habitLogsKeys.userToday(user?.id ?? null);
      }
      if (normalizedStartDate && normalizedEndDate) {
        return habitLogsKeys.userRange(user?.id ?? null, normalizedStartDate, normalizedEndDate);
      }
      return habitLogsKeys.user(user?.id ?? null);
    }
  };

  // Query for habit logs
  const {
    data: logs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: getQueryKey(),
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

      // Apply date filters
      if (includeTodayOnly) {
        const today = getTodayDate();
        query = query.eq('date', today);
      } else if (normalizedStartDate && normalizedEndDate) {
        // Filter by date range
        query = query.gte('date', normalizedStartDate).lte('date', normalizedEndDate);
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
      // Cancel outgoing refetches for all related queries
      await queryClient.cancelQueries({
        queryKey: habitLogsKeys.habit(params.habitId),
      });
      await queryClient.cancelQueries({
        queryKey: habitLogsKeys.today(params.habitId),
      });
      await queryClient.cancelQueries({
        queryKey: habitLogsKeys.userToday(user?.id ?? null),
      });
      await queryClient.cancelQueries({
        queryKey: habitLogsKeys.user(user?.id ?? null),
      });
      // Cancel queries for date ranges (using prefix matching)
      await queryClient.cancelQueries({
        queryKey: ['habit_logs', 'habit', params.habitId, 'range'],
        exact: false,
      });
      await queryClient.cancelQueries({
        queryKey: ['habit_logs', 'user', user?.id ?? null, 'range'],
        exact: false,
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
      const previousUserLogs = queryClient.getQueryData<HabitLog[]>(
        habitLogsKeys.user(user?.id ?? null)
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

      // Update user logs query (all logs, not just today)
      if (previousUserLogs) {
        const existingIndex = previousUserLogs.findIndex(
          (log) => log.habit_id === params.habitId && formatDate(log.date) === targetDate
        );
        if (existingIndex >= 0) {
          const updated = [...previousUserLogs];
          updated[existingIndex] = optimisticLog;
          queryClient.setQueryData(habitLogsKeys.user(user?.id ?? null), updated);
        } else {
          queryClient.setQueryData(habitLogsKeys.user(user?.id ?? null), [
            optimisticLog,
            ...previousUserLogs,
          ]);
        }
      }

      return {
        previousLogs,
        previousTodayLogs,
        previousUserTodayLogs,
        previousUserLogs,
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
      if (context?.previousUserLogs) {
        queryClient.setQueryData(
          habitLogsKeys.user(user?.id ?? null),
          context.previousUserLogs
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
      queryClient.invalidateQueries({
        queryKey: habitLogsKeys.user(user?.id ?? null),
      });
      // Invalidate date range queries (using prefix matching)
      queryClient.invalidateQueries({
        queryKey: ['habit_logs', 'habit', params.habitId, 'range'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['habit_logs', 'user', user?.id ?? null, 'range'],
        exact: false,
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
      queryClient.setQueryData(habitLogsKeys.user(null), []);
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

/**
 * Custom hook for fetching today's habit logs using React Query
 * 
 * This is a convenience hook that wraps useHabitLogs with includeTodayOnly: true.
 * It provides a simpler API for getting only today's logs.
 * 
 * @param habitId - Optional habit ID. If provided, returns today's logs for that habit only.
 *                  If not provided, returns today's logs for all user habits.
 * 
 * @returns Object containing:
 *   - logs: Array of today's habit logs
 *   - isLoading: Loading state
 *   - error: Error object if query failed
 *   - refetch: Function to manually refetch logs
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useTodayLogs } from '@/hooks/useHabitLogs'
 * 
 * function TodayHabits() {
 *   // Get today's logs for all habits
 *   const { logs, isLoading } = useTodayLogs()
 *   
 *   // Get today's logs for a specific habit
 *   const { logs: habitLogs } = useTodayLogs('habit-id-123')
 *   
 *   return (
 *     <div>
 *       {logs.map(log => (
 *         <div key={log.id}>{log.habit_id} - {log.completed ? 'Done' : 'Not done'}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useTodayLogs(habitId?: string) {
  return useHabitLogs({
    habitId,
    includeTodayOnly: true,
  });
}

