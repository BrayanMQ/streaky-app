'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, TrendingUp, Settings, Loader2, LogOut, ClipboardList, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Header component
 * 
 * Reusable header component with navigation, logo, and sign out functionality.
 * Used across dashboard pages for consistent UI/UX.
 * 
 * On mobile: Shows page title with back button (similar to stats page)
 * On desktop: Shows logo and navigation icons
 */
export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, signOutPending } = useAuth();

  // Map routes to page titles and icons
  const pageInfo: Record<string, { title: string; icon: React.ComponentType<{ className?: string }> }> = {
    '/dashboard': { title: 'Today', icon: LayoutDashboard },
    '/dashboard/habits': { title: 'My Habits', icon: ClipboardList },
    '/dashboard/calendar': { title: 'Calendar', icon: Calendar },
    '/dashboard/stats': { title: 'Statistics', icon: TrendingUp },
    '/dashboard/settings': { title: 'Settings', icon: Settings },
  };

  const currentPage = pageInfo[pathname] || { title: 'Streaky', icon: Flame };

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.error) {
        console.error('Sign out error:', result.error);
        router.push('/auth/login');
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      router.push('/auth/login');
    }
  };

  const handleBack = () => {
    if (pathname !== '/dashboard') {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  const IconComponent = currentPage.icon;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile: Page title only (no back button) */}
        <div className="flex items-center gap-2 md:hidden">
          <IconComponent className="size-6 text-primary" />
          <span className="font-bold text-xl">{currentPage.title}</span>
        </div>

        {/* Desktop: Back button + Logo */}
        <div className="hidden md:flex items-center gap-4">
          {pathname !== '/dashboard' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="hover:bg-muted/80"
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Flame className="h-6 w-6 text-primary" />
            <span>Streaky</span>
          </Link>
        </div>

        {/* Desktop: Navigation icons */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              title="Today"
              className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
            >
              <LayoutDashboard className="h-5 w-5 relative z-10" />
            </Button>
          </Link>
          <Link href="/dashboard/habits">
            <Button
              variant="ghost"
              size="icon"
              title="My Habits"
              className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
            >
              <ClipboardList className="h-5 w-5 relative z-10" />
            </Button>
          </Link>
          <Link href="/dashboard/calendar">
            <Button
              variant="ghost"
              size="icon"
              title="Calendar"
              className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
            >
              <Calendar className="h-5 w-5 relative z-10" />
            </Button>
          </Link>
          <Link href="/dashboard/stats">
            <Button
              variant="ghost"
              size="icon"
              title="Stats"
              className="relative !hover:bg-[hsl(var(--primary)/0.25)] hover:border hover:border-[hsl(var(--primary)/0.35)]! hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.25)]! rounded-lg transition-all duration-200 hover:scale-110"
            >
              <TrendingUp className="h-5 w-5 relative z-10" />
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              size="icon"
              title="Settings"
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
        </nav>
      </div>
    </header>
  );
}

