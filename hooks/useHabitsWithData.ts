'use client';

import { useMemo } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { getCurrentStreak } from '@/lib/streaks';
import { isCompletedToday } from '@/lib/habits';
import { getHabitColor } from '@/lib/habitColors';
import type { HabitWithLogs } from '@/types/database';

/**
 * Custom hook that combines habits with their logs and calculates derived data
 * 
 * This hook provides:
 * - Habits combined with their logs
 * - Calculated streaks for each habit
 * - Today's completion status for each habit
 * - Optimized color getter function
 * 
 * Uses the optimized Map-based approach for O(1) log lookups.
 * 
 * @returns Object containing:
 *   - habitsWithData: Array of habits with streak and completedToday calculated
 *   - getHabitColor: Function to get color class for a habit
 *   - isLoading: Loading state (true if either habits or logs are loading)
 *   - error: Error state (habits error or logs error)
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useHabitsWithData } from '@/hooks/useHabitsWithData'
 * 
 * function HabitsList() {
 *   const { habitsWithData, getHabitColor, isLoading } = useHabitsWithData()
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   
 *   return (
 *     <div>
 *       {habitsWithData.map(habit => (
 *         <div key={habit.id}>
 *           <h3>{habit.title}</h3>
 *           <p>Streak: {habit.streak} days</p>
 *           <p>Completed today: {habit.completedToday ? 'Yes' : 'No'}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useHabitsWithData() {
  const { habits, isLoading: isLoadingHabits, error: habitsError } = useHabits();
  const {
    logs: allLogs,
    isLoading: isLoadingLogs,
    error: logsError,
  } = useHabitLogs();

  // Optimize log lookup by creating a Map indexed by habit_id
  // This avoids O(n*m) complexity when filtering logs for each habit
  // Using a single pass for O(n) complexity
  const logsByHabitId = useMemo(() => {
    const map = new Map<string, typeof allLogs>();
    for (const log of allLogs) {
      const existing = map.get(log.habit_id);
      if (existing) {
        existing.push(log);
      } else {
        map.set(log.habit_id, [log]);
      }
    }
    return map;
  }, [allLogs]);

  // Combine habits with their logs and calculate streaks/completion
  // Memoized to avoid recalculating on every render
  const habitsWithData = useMemo<HabitWithLogs[]>(() => {
    if (!habits.length) return [];

    return habits.map((habit) => {
      // Get logs for this specific habit using optimized Map lookup
      const habitLogs = logsByHabitId.get(habit.id) || [];
      
      // Calculate streak and completion status
      const streak = getCurrentStreak(habit.id, habitLogs);
      const completedToday = isCompletedToday(habitLogs);

      return {
        ...habit,
        streak,
        completedToday,
      };
    });
  }, [habits, logsByHabitId]);

  // Create a memoized color getter function that uses the habit index
  const getHabitColorWithIndex = useMemo(() => {
    return (habit: HabitWithLogs): string => {
      const index = habitsWithData.indexOf(habit);
      return getHabitColor(habit, index);
    };
  }, [habitsWithData]);

  return {
    habitsWithData,
    getHabitColor: getHabitColorWithIndex,
    isLoading: isLoadingHabits || isLoadingLogs,
    error: habitsError || logsError,
    habitsError,
    logsError,
  };
}

