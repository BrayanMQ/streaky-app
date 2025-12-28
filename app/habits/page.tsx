'use client';

import { HabitList } from '@/components/HabitList';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useHabitsWithData } from '@/hooks/useHabitsWithData';

/**
 * Habits page
 * 
 * Displays the user's list of habits with management options.
 * Includes ability to create, edit, and delete habits.
 */
export default function HabitsPage() {
  const { openAddHabitModal } = useUIStore();
  const { habitsWithData } = useHabitsWithData();
  const totalHabits = habitsWithData.length;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8 mb-20 md:mb-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-bold text-3xl">My Habits</h1>
          {totalHabits > 0 && (
            <Button size="lg" onClick={openAddHabitModal} className="hidden md:flex">
              <Plus className="mr-2 h-5 w-5" />
              Add New Habit
            </Button>
          )}
        </div>
        <HabitList mode="management" />
        {totalHabits > 0 && (
          <div className="mt-6 md:hidden">
            <Button size="lg" className="w-full" onClick={openAddHabitModal}>
              <Plus className="mr-2 h-5 w-5" />
              Add New Habit
            </Button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

