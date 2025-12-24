'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HabitWithLogs } from '@/types/database';

interface HabitCardProps {
  habit: HabitWithLogs;
  onToggle: (habitId: string) => void;
  isToggling?: boolean;
  getHabitColor?: (habit: HabitWithLogs) => string;
}

/**
 * HabitCard component
 * 
 * Displays a habit card with:
 * - Habit title
 * - Completion status (visual indicator)
 * - Current streak
 * - One-tap toggle to mark as completed
 */
export function HabitCard({
  habit,
  onToggle,
  isToggling = false,
  getHabitColor,
}: HabitCardProps) {
  // Default color function if not provided
  const defaultGetHabitColor = (habit: HabitWithLogs): string => {
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
    // Default color if no color is set
    return 'bg-primary';
  };

  const getColor = getHabitColor || defaultGetHabitColor;
  const habitColor = getColor(habit);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        habit.completedToday && 'border-primary bg-primary/5',
        isToggling && 'opacity-50 pointer-events-none',
      )}
      onClick={() => onToggle(habit.id)}
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
}

