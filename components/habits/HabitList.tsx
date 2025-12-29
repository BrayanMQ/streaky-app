'use client';

import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertCircle, Flame, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitCard } from './HabitCard';
import { HabitCardSkeleton } from './HabitCardSkeleton';
import { AddHabitModal } from './AddHabitModal';
import { EditHabitModal } from './EditHabitModal';
import { DeleteHabitConfirmModal } from './DeleteHabitConfirmModal';
import { useHabitsWithData } from '@/hooks/useHabitsWithData';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useHabits } from '@/hooks/useHabits';
import { useUIStore } from '@/store/ui';

/**
 * HabitList component
 * 
 * Displays a list of user habits with:
 * - Loading state with spinner
 * - Error state with retry option
 * - Empty state with CTA to create first habit
 * - List of habits using HabitCard components
 * - Optimized data fetching and calculations
 * - Support for execution (dashboard) and management (habits page) modes
 */
export function HabitList({ mode = 'execution' }: { mode?: 'execution' | 'management' }) {
  const { openAddHabitModal } = useUIStore();
  
  // Use centralized hook for habits with data
  const {
    habitsWithData,
    getHabitColor,
    isLoading: isLoadingHabitsData,
    habitsError,
    logsError: habitsDataLogsError,
  } = useHabitsWithData();
  
  // Get toggle functionality from useHabitLogs
  const {
    toggleCompletion,
    isToggling,
    toggleError,
    refetch: refetchLogs,
  } = useHabitLogs();
  
  // Get refetch for habits
  const { refetch: refetchHabits } = useHabits();

  const handleToggleHabit = async (habitId: string) => {
    try {
      const habit = habitsWithData.find(h => h.id === habitId);
      const wasCompleted = habit?.completedToday ?? false;
      
      await toggleCompletion({ habitId });
      
      // Show success toast with contextual message
      if (!wasCompleted) {
        const streak = habit?.streak ?? 0;
        if (streak >= 7) {
          toast.success('Excellent!', {
            description: `You have completed “${habit?.title}”. ${streak} days in a row! 🔥`,
          });
        } else if (streak >= 3) {
          toast.success('Well done!', {
            description: `You have completed “${habit?.title}”. ${streak} days in a row.`,
          });
        } else {
          toast.success('Habit completed', {
            description: `You have completed “${habit?.title}” today.`,
          });
        }
      } else {
        toast.info('Habit unchecked', {
          description: `You have unchecked “${habit?.title}” for today.`,
        });
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      const habit = habitsWithData.find(h => h.id === habitId);
      toast.error('Error updating habit', {
        description: `Could not ${habit?.completedToday ? 'uncheck' : 'check'} "${habit?.title}". Please try again.`,
      });
    }
  };

  const handleRetry = () => {
    if (habitsError) {
      refetchHabits();
    }
    if (habitsDataLogsError) {
      refetchLogs();
    }
  };

  // Loading state - show skeleton loaders while data is loading
  if (isLoadingHabitsData) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <HabitCardSkeleton key={index} />
        ))}
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
  const hasNonCriticalError = habitsDataLogsError || toggleError;

  return (
    <div className="space-y-4">
      {/* Non-critical error messages */}
      {hasNonCriticalError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive mb-1">
              {habitsDataLogsError ? 'Error loading habit logs' : 'Error updating habit'}
            </p>
            <p className="text-sm text-muted-foreground">
              {habitsDataLogsError?.message || toggleError?.message || 'An error occurred. Please try again.'}
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
        {habitsWithData.map((habit, index) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: 'easeOut',
            }}
          >
            <HabitCard
              habit={habit}
              onToggle={handleToggleHabit}
              isToggling={isToggling}
              getHabitColor={getHabitColor}
              mode={mode}
            />
          </motion.div>
        ))}
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal />
      
      {/* Edit Habit Modal */}
      <EditHabitModal />

      {/* Delete Habit Confirmation Modal */}
      <DeleteHabitConfirmModal />
    </div>
  );
}

