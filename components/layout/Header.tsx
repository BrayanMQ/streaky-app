'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, TrendingUp, Settings, Menu, Loader2, LogOut, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Header component
 * 
 * Reusable header component with navigation, logo, and sign out functionality.
 * Used across dashboard pages for consistent UI/UX.
 */
export function Header() {
  const router = useRouter();
  const { signOut, signOutPending } = useAuth();

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
          <Link href="/habits">
            <Button
              variant="ghost"
              size="icon"
              title="My Habits"
              className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
            >
              <ClipboardList className="h-5 w-5 relative z-10" />
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
  );
}

