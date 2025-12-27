'use client';

import { HabitList } from '@/components/HabitList';

/**
 * Habits page
 * 
 * Displays the user's list of habits using the HabitList component.
 */
export default function HabitsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-8 font-bold text-3xl">My Habits</h1>
        <HabitList />
      </main>
    </div>
  );
}

