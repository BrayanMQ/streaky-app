'use client';

import { useMemo } from 'react';
import { Loader2, AlertCircle, Flame, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitModal } from '@/components/AddHabitModal';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useUIStore } from '@/store/ui';
import { calculateStreak, isCompletedToday } from '@/lib/habits';
import type { HabitWithLogs } from '@/types/database';

/**
 * HabitList component
 * 
 * Displays a list of user habits with:
 * - Loading state with spinner
 * - Error state with retry option
 * - Empty state with CTA to create first habit
 * - List of habits using HabitCard components
 * - Optimized data fetching and calculations
 */
export function HabitList() {
  // Fetch habits and logs in parallel (React Query handles this automatically)
  const { habits, isLoading: isLoadingHabits, error: habitsError, refetch: refetchHabits } = useHabits();
  const { openAddHabitModal } = useUIStore();
  const {
    logs: allLogs,
    isLoading: isLoadingLogs,
    error: logsError,
    toggleCompletion,
    isToggling,
    toggleError,
    refetch: refetchLogs,
  } = useHabitLogs();

  // Optimize log lookup by creating a Map indexed by habit_id
  // This avoids O(n*m) complexity when filtering logs for each habit
  const logsByHabitId = useMemo(() => {
    const map = new Map<string, typeof allLogs>();
    for (const log of allLogs) {
      const existing = map.get(log.habit_id) || [];
      map.set(log.habit_id, [...existing, log]);
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
      const streak = calculateStreak(habitLogs);
      const completedToday = isCompletedToday(habitLogs);

      return {
        ...habit,
        streak,
        completedToday,
      };
    });
  }, [habits, logsByHabitId]);

  // Get default color class for habit (fallback if no color set)
  const getHabitColor = (habit: HabitWithLogs): string => {
    if (habit.color) {
      // If color is stored as a Tailwind class, use it directly
      if (habit.color.startsWith('bg-')) {
        return habit.color;
      }
      // Otherwise, try to map common color names
      const colorMap: Record<string, string> = {
        orange: 'bg-orange-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        cyan: 'bg-cyan-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        pink: 'bg-pink-500',
      };
      return colorMap[habit.color.toLowerCase()] || 'bg-primary';
    }
    // Default color rotation based on habit index
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-cyan-500',
      'bg-green-500',
    ];
    const index = habitsWithData.indexOf(habit);
    return colors[index % colors.length];
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      await toggleCompletion({ habitId });
    } catch (error) {
      console.error('Error toggling habit:', error);
      // Error is already handled by React Query's error state
      // The optimistic update will be rolled back automatically
    }
  };

  const handleRetry = () => {
    if (habitsError) {
      refetchHabits();
    }
    if (logsError) {
      refetchLogs();
    }
  };

  // Loading state - show while either query is loading
  if (isLoadingHabits || isLoadingLogs) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    );
  }

  // Error state - show error if habits fail to load (critical error)
  if (habitsError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Error loading habits</p>
          <p className="text-sm text-muted-foreground mb-6">{habitsError.message}</p>
          <Button onClick={handleRetry}>Retry</Button>
        </div>
      </div>
    );
  }

  // Empty state - show when no habits exist
  if (habitsWithData.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="mb-4">
            <Flame className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No habits yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first habit to start tracking your progress!
          </p>
          <Button size="lg" onClick={openAddHabitModal}>
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Habit
          </Button>
        </div>
        <AddHabitModal />
      </>
    );
  }

  // Show non-critical errors (logs error) as a banner, but don't block the view
  const hasNonCriticalError = logsError || toggleError;

  return (
    <div className="space-y-4">
      {/* Non-critical error messages */}
      {hasNonCriticalError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive mb-1">
              {logsError ? 'Error loading habit logs' : 'Error updating habit'}
            </p>
            <p className="text-sm text-muted-foreground">
              {logsError?.message || toggleError?.message || 'An error occurred. Please try again.'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleRetry}
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-4">
        {habitsWithData.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={handleToggleHabit}
            isToggling={isToggling}
            getHabitColor={getHabitColor}
          />
        ))}
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal />
    </div>
  );
}

