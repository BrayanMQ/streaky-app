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
import { ArchiveHabitConfirmModal } from './ArchiveHabitConfirmModal';
import { useHabitsWithData } from '@/hooks/useHabitsWithData';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useHabits } from '@/hooks/useHabits';
import { useUIStore } from '@/store/ui';
import { useTranslation } from 'react-i18next';
import I18nProvider from '@/components/I18nProvider';

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
  const { t } = useTranslation();
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
          toast.success(t('habits.list.excellent'), {
            description: t('habits.list.completedContextHigh', { title: habit?.title, count: streak }),
          });
        } else if (streak >= 3) {
          toast.success(t('habits.list.wellDone'), {
            description: t('habits.list.completedContextMid', { title: habit?.title, count: streak }),
          });
        } else {
          toast.success(t('habits.list.habitCompleted'), {
            description: t('habits.list.completedContextLow', { title: habit?.title }),
          });
        }
      } else {
        toast.info(t('habits.list.habitUnchecked'), {
          description: t('habits.list.uncheckedContext', { title: habit?.title }),
        });
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      const habit = habitsWithData.find(h => h.id === habitId);
      toast.error(t('habits.list.errorUpdating'), {
        description: habit?.completedToday
          ? t('habits.list.couldNotUncheck', { title: habit?.title })
          : t('habits.list.couldNotCheck', { title: habit?.title }),
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
      <I18nProvider>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">{t('habits.list.errorLoading')}</p>
            <p className="text-sm text-muted-foreground mb-6">{habitsError.message}</p>
            <Button onClick={handleRetry}>{t('habits.list.retry')}</Button>
          </div>
        </div>
      </I18nProvider>
    );
  }

  // Empty state - show when no habits exist
  if (habitsWithData.length === 0) {
    return (
      <I18nProvider>
        <div className="text-center py-12">
          <div className="mb-4">
            <Flame className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">{t('habits.list.noHabits')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('habits.list.createFirstDesc')}
          </p>
          <Button size="lg" onClick={openAddHabitModal}>
            <Plus className="mr-2 h-5 w-5" />
            {t('habits.list.createFirstBtn')}
          </Button>
        </div>
        <AddHabitModal />
      </I18nProvider>
    );
  }

  // Show non-critical errors (logs error) as a banner, but don't block the view
  const hasNonCriticalError = habitsDataLogsError || toggleError;

  return (
    <I18nProvider>
      <div className="space-y-4">
        {/* Non-critical error messages */}
        {hasNonCriticalError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive mb-1">
                {habitsDataLogsError ? t('habits.list.errorLoadingLogs') : t('habits.list.errorUpdating')}
              </p>
              <p className="text-sm text-muted-foreground">
                {habitsDataLogsError?.message || toggleError?.message || t('habits.list.genericError')}
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

        {/* Archive Habit Confirmation Modal */}
        <ArchiveHabitConfirmModal />
      </div>
    </I18nProvider>
  );
}

