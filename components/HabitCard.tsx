'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHabitColor as getHabitColorUtil } from '@/lib/habitColors';
import { useUIStore } from '@/store/ui';
import type { HabitWithLogs } from '@/types/database';

interface HabitCardProps {
  habit: HabitWithLogs;
  onToggle: (habitId: string) => void;
  isToggling?: boolean;
  getHabitColor?: (habit: HabitWithLogs) => string;
  mode?: 'execution' | 'management';
}

/**
 * HabitCard component
 * 
 * Displays a habit card with:
 * - Habit title
 * - Completion status (visual indicator)
 * - Current streak
 * - One-tap toggle to mark as completed (in execution mode)
 * - Actions menu for editing/deleting (in management mode)
 */
export function HabitCard({
  habit,
  onToggle,
  isToggling = false,
  getHabitColor,
  mode = 'execution',
}: HabitCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setSelectedHabit, openEditHabitModal, openDeleteHabitModal } = useUIStore();

  // Use provided color function or fallback to centralized utility
  const getColor = getHabitColor || ((h: HabitWithLogs) => getHabitColorUtil(h));
  const habitColor = getColor(habit);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHabit(habit);
    openEditHabitModal();
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHabit(habit);
    openDeleteHabitModal();
    setIsMenuOpen(false);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const isExecution = mode === 'execution';

  return (
    <Card
      className={cn(
        'transition-all relative',
        isExecution ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
        isExecution && habit.completedToday && 'border-primary bg-primary/5',
        isToggling && 'opacity-50 pointer-events-none',
      )}
      onClick={() => isExecution && onToggle(habit.id)}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
              isExecution 
                ? (habit.completedToday ? habitColor : 'bg-muted')
                : habitColor // Always show color in management mode
            )}
          >
            {isExecution && (
              habit.completedToday ? (
                <span className="text-2xl">✓</span>
              ) : (
                <span className="text-2xl opacity-30">○</span>
              )
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{habit.title}</h3>
            {isExecution && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Flame className="h-4 w-4 text-primary" />
                <span>{habit.streak ?? 0} day streak</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions Menu - Only show in management mode */}
        {mode === 'management' && (
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleMenuToggle}
              disabled={isToggling}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-10 z-50 w-40 rounded-md border bg-background shadow-lg">
                <div className="p-1 space-y-1">
                  <Button
                    variant="ghost"
                    onClick={handleEdit}
                    className="w-full justify-start font-normal h-9 px-2"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    className="w-full justify-start font-normal h-9 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

