'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HabitList } from '@/components/habits/HabitList';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Plus, Loader2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHabitsWithData } from '@/hooks/useHabitsWithData';
import { useUIStore } from '@/store/ui';

/**
 * Dashboard page
 * 
 * Displays user's habits with completion tracking, streaks, and progress.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { signOutError } = useAuth();
  const { openAddHabitModal } = useUIStore();
  
  // Use centralized hook for habits with data (for stats only)
  const {
    habitsWithData,
    isLoading: isLoadingHabitsData,
    habitsError,
    logsError: habitsDataLogsError,
  } = useHabitsWithData();
  
  // Note: toggleError is handled by HabitList component

  // Calculate today's completion stats
  const completedToday = habitsWithData.filter((h) => h.completedToday).length;
  const totalHabits = habitsWithData.length;
  const completionPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Loading state
  if (isLoadingHabitsData) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <div className="container mx-auto flex-1 flex items-center justify-center px-4 py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading habits...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - show error if habits fail to load (critical error)
  if (habitsError) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <div className="container mx-auto flex-1 flex items-center justify-center px-4 py-8">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error loading habits</p>
            <p className="text-sm text-muted-foreground mb-6">{habitsError.message}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  // Note: habitsDataLogsError and toggleError are handled by HabitList component

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8 mb-20 md:mb-0">
        {/* Error Messages */}
        {/* Note: habitsDataLogsError and toggleError are handled by HabitList component */}
        {signOutError && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive mb-1">Sign out error</p>
              <p className="text-sm text-muted-foreground">
                {signOutError.message || 'An error occurred while signing out.'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => {
                // Force redirect even on error
                router.push('/auth/login');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Today's Habits</h1>
          {totalHabits > 0 ? (
            <>
              <p className="text-muted-foreground">
                {completedToday} of {totalHabits} completed
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No habits yet. Create your first habit to get started!</p>
          )}
        </div>

        {/* Habits List - uses HabitList component to avoid duplication */}
        <div className="mb-8">
          <HabitList mode="execution" />
        </div>

        {/* Add Habit Button (only show if there are habits) */}
        {totalHabits > 0 && (
          <Button size="lg" className="w-full md:w-auto" onClick={openAddHabitModal}>
            <Plus className="mr-2 h-5 w-5" />
            Add New Habit
          </Button>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
