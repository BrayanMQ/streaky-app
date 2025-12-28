'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  List, 
  Settings, 
  Calendar, 
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BottomNav component
 * 
 * Mobile-only navigation bar fixed to the bottom of the screen.
 * Provides quick access to main sections: Dashboard, Habits, Calendar, Stats, and Settings.
 */
export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Today',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Habits',
      href: '/habits',
      icon: List,
    },
    {
      label: 'Calendar',
      href: '/dashboard/calendar',
      icon: Calendar,
    },
    {
      label: 'Stats',
      href: '/dashboard/stats',
      icon: TrendingUp,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-300 ease-in-out',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                isActive 
                  ? "bg-primary/15 scale-110 shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                  : "hover:bg-muted group-hover:scale-105"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "stroke-[2.5px] scale-100" : "scale-90"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-tight transition-all duration-300",
                isActive ? "opacity-100 translate-y-0" : "opacity-70 scale-95"
              )}>
                {item.label}
              </span>
              
              {/* Active bar indicator */}
              {isActive && (
                <div 
                  className="absolute bottom-1 h-0.5 w-8 rounded-full bg-primary animate-in fade-in slide-in-from-bottom-1 duration-500 ease-out"
                />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area inset for mobile devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
