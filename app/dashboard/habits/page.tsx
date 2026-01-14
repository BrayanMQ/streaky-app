'use client';

import { HabitList } from '@/components/habits/HabitList';
import { ArchivedHabitsSection } from '@/components/habits/ArchivedHabitsSection';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useHabitsWithData } from '@/hooks/useHabitsWithData';
import { useTranslation } from 'react-i18next';
import I18nProvider from '@/components/I18nProvider';

/**
 * Habits page
 * 
 * Displays the user's list of habits with management options.
 * Includes ability to create, edit, and delete habits.
 */
export default function HabitsPage() {
  const { t } = useTranslation();
  const { openAddHabitModal } = useUIStore();
  const { habitsWithData } = useHabitsWithData();
  const totalHabits = habitsWithData.length;

  return (
    <I18nProvider>
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <main className="container mx-auto flex-1 px-4 pt-4 md:pt-8 pb-8 mb-20 md:mb-0">
          <div className="flex items-center justify-end mb-6 md:mb-8">
            {totalHabits > 0 && (
              <Button size="lg" onClick={openAddHabitModal} className="hidden md:flex">
                <Plus className="mr-2 h-5 w-5" />
                {t('habits.management.addNew')}
              </Button>
            )}
          </div>
          <HabitList mode="management" />
          <ArchivedHabitsSection />
          {totalHabits > 0 && (
            <div className="mt-6 md:hidden">
              <Button size="lg" className="w-full" onClick={openAddHabitModal}>
                <Plus className="mr-2 h-5 w-5" />
                {t('habits.management.addNew')}
              </Button>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </I18nProvider>
  );
}

