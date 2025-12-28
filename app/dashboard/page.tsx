'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HabitList } from '@/components/HabitList';
import { Flame, Plus, Calendar, TrendingUp, Settings, Menu, Loader2, LogOut, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHabitsWithData } from '@/hooks/useHabitsWithData';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useUIStore } from '@/store/ui';

/**
 * Dashboard page
 * 
 * Displays user's habits with completion tracking, streaks, and progress.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { signOut, signOutPending, signOutError } = useAuth();
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
          <HabitList />
        </div>

        {/* Add Habit Button (only show if there are habits) */}
        {totalHabits > 0 && (
          <Button size="lg" className="w-full md:w-auto" onClick={openAddHabitModal}>
            <Plus className="mr-2 h-5 w-5" />
            Add New Habit
          </Button>
        )}
      </main>
    </div>
  );
}
