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

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md relative',
        habit.completedToday && 'border-primary bg-primary/5',
        isToggling && 'opacity-50 pointer-events-none',
      )}
      onClick={() => onToggle(habit.id)}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4 flex-1">
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
        
        {/* Actions Menu */}
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
              <div className="p-1">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent transition-colors text-left"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

