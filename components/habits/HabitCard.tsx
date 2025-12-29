'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHabitColor as getHabitColorUtil } from '@/lib/habitColors';
import { useUIStore } from '@/store/ui';
import { ConfettiEffect } from './ConfettiEffect';
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(habit.completedToday);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setSelectedHabit, openEditHabitModal, openDeleteHabitModal } = useUIStore();

  // Use provided color function or fallback to centralized utility
  const getColor = getHabitColor || ((h: HabitWithLogs) => getHabitColorUtil(h));
  const habitColor = getColor(habit);

  // Show confetti when habit is completed and streak >= 7
  useEffect(() => {
    if (habit.completedToday && !prevCompleted) {
      // Haptic feedback for mobile devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const streak = habit.streak ?? 0;
        if (streak >= 7) {
          // Longer vibration for important streaks
          navigator.vibrate(100);
        } else {
          // Short vibration for regular completion
          navigator.vibrate(50);
        }
      }
      
      // Show confetti for streaks >= 7
      if ((habit.streak ?? 0) >= 7) {
        setShowConfetti(true);
      }
    }
    setPrevCompleted(habit.completedToday);
  }, [habit.completedToday, habit.streak, prevCompleted]);

  // Close menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
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

  const handleCardClick = () => {
    if (isExecution && !isToggling) {
      onToggle(habit.id);
    }
  };

  const handleTouchStart = () => {
    // Immediate visual feedback on touch
    if (isExecution && !isToggling) {
      // The active:scale-[0.98] class will handle the visual feedback
    }
  };

  return (
    <>
      {showConfetti && (
        <ConfettiEffect onComplete={() => setShowConfetti(false)} />
      )}
      <Card
      className={cn(
        'transition-all duration-300 ease-in-out relative',
        isExecution ? 'cursor-pointer hover:shadow-md active:scale-[0.98] touch-manipulation' : 'cursor-default',
        isExecution && habit.completedToday && 'border-primary bg-primary/5',
        isToggling && 'opacity-50 pointer-events-none',
      )}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      style={{
        minHeight: isExecution ? '44px' : undefined, // Ensure minimum touch target size
      }}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4 flex-1">
          <motion.div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              isExecution 
                ? (habit.completedToday ? habitColor : 'bg-muted')
                : habitColor // Always show color in management mode
            )}
            animate={{
              scale: habit.completedToday ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            {isExecution && (
              habit.completedToday ? (
                <motion.span
                  className="text-2xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                >
                  ✓
                </motion.span>
              ) : (
                <span className="text-2xl opacity-30">○</span>
              )
            )}
          </motion.div>
          <div>
            <h3 className="font-semibold text-lg">{habit.title}</h3>
            {isExecution && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Flame className="h-4 w-4 text-orange-500/80" />
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
    </>
  );
}

