'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Plus, Calendar, TrendingUp, Settings, Menu, Loader2, LogOut, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { calculateStreak, isCompletedToday } from '@/lib/habits';
import type { HabitWithLogs } from '@/types/database';

/**
 * Dashboard page
 * 
 * Displays user's habits with completion tracking, streaks, and progress.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { signOut, signOutPending, signOutError } = useAuth();
  const { habits, isLoading: isLoadingHabits, error: habitsError } = useHabits();
  // Get all logs (not just today) to calculate streaks
  const {
    logs: allLogs,
    isLoading: isLoadingLogs,
    error: logsError,
    toggleCompletion,
    isToggling,
    toggleError,
  } = useHabitLogs();

  // Combine habits with their logs and calculate streaks/completion
  const habitsWithData = useMemo<HabitWithLogs[]>(() => {
    if (!habits.length) return [];

    return habits.map((habit) => {
      // Get logs for this specific habit
      const habitLogs = allLogs.filter((log) => log.habit_id === habit.id);
      
      // Calculate streak and completion status
      const streak = calculateStreak(habitLogs);
      const completedToday = isCompletedToday(habitLogs);

      return {
        ...habit,
        streak,
        completedToday,
      };
    });
  }, [habits, allLogs]);

  // Calculate today's completion stats
  const completedToday = habitsWithData.filter((h) => h.completedToday).length;
  const totalHabits = habitsWithData.length;
  const completionPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Loading state
  if (isLoadingHabits || isLoadingLogs) {
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

  // Note: logsError is handled below in the UI, not blocking the view

  const handleToggleHabit = async (habitId: string) => {
    try {
      await toggleCompletion({ habitId });
    } catch (error) {
      console.error('Error toggling habit:', error);
      // Error is already handled by React Query's error state
      // The optimistic update will be rolled back automatically
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.error) {
        console.error('Sign out error:', result.error);
        // Even if there's an error, redirect to login
        router.push('/auth/login');
      } else {
        // Redirect to login after successful sign out
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Redirect to login even on error
      router.push('/auth/login');
    }
  };

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

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Flame className="h-6 w-6 text-primary" />
            <span>Streaky</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard/calendar">
              <Button
                variant="ghost"
                size="icon"
                className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
              >
                <Calendar className="h-5 w-5 relative z-10" />
              </Button>
            </Link>
            <Link href="/dashboard/stats">
              <Button
                variant="ghost"
                size="icon"
                className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
              >
                <TrendingUp className="h-5 w-5 relative z-10" />
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                size="icon"
                className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
              >
                <Settings className="h-5 w-5 relative z-10" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              disabled={signOutPending}
              title="Sign out"
              className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:border-0 disabled:hover:shadow-none"
            >
              {signOutPending ? (
                <Loader2 className="h-5 w-5 animate-spin relative z-10" />
              ) : (
                <LogOut className="h-5 w-5 relative z-10" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
            >
              <Menu className="h-5 w-5 relative z-10" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Error Messages */}
        {logsError && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive mb-1">Error loading habit logs</p>
              <p className="text-sm text-muted-foreground">
                {logsError.message || 'Failed to load habit completion data. Streaks may not be accurate.'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => window.location.reload()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {toggleError && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive mb-1">
                Error updating habit
              </p>
              <p className="text-sm text-muted-foreground">
                {toggleError.message || 'Failed to update habit completion. Please try again.'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => {
                // Clear error by refetching
                window.location.reload();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

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

        {/* Habits List */}
        {totalHabits > 0 ? (
          <div className="mb-8 space-y-4">
            {habitsWithData.map((habit) => {
              const habitColor = getHabitColor(habit);
              const isTogglingThisHabit = isToggling;

              return (
                <Card
                  key={habit.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    habit.completedToday && 'border-primary bg-primary/5',
                    isTogglingThisHabit && 'opacity-50 pointer-events-none',
                  )}
                  onClick={() => handleToggleHabit(habit.id)}
                >
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full',
                          habit.completedToday ? habitColor : 'bg-muted',
                        )}
                      >
                        {habit.completedToday ? (
                          <span className="text-2xl">✓</span>
                        ) : (
                          <span className="text-2xl opacity-30">○</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{habit.title}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Flame className="h-4 w-4 text-primary" />
                          <span>{habit.streak ?? 0} day streak</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="mb-8 text-center py-12">
            <div className="mb-4">
              <Flame className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No habits yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first habit to start tracking your progress!
            </p>
            <Link href="/habits/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Habit
              </Button>
            </Link>
          </div>
        )}

        {/* Add Habit Button (only show if there are habits) */}
        {totalHabits > 0 && (
          <Link href="/habits/new">
            <Button size="lg" className="w-full md:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Add New Habit
            </Button>
          </Link>
        )}
      </main>
    </div>
  );
}
