'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useArchivedHabits } from '@/hooks/useHabits';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getHabitColor } from '@/lib/habitColors';
import type { Habit } from '@/types/database';

/**
 * ArchivedHabitsSection component
 * 
 * Displays a collapsible section containing archived habits.
 * Shows at the bottom of the habits page.
 */
export function ArchivedHabitsSection() {
    const { t } = useTranslation();
    const { archivedHabits, isLoading } = useArchivedHabits();
    const [isExpanded, setIsExpanded] = useState(false);

    // Don't render anything if there are no archived habits
    if (!isLoading && archivedHabits.length === 0) {
        return null;
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="mt-8">
            {/* Collapsible Header */}
            <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full justify-between h-12 px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
                <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    <span className="font-medium">
                        {t('habits.archived.title')}
                    </span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {archivedHabits.length}
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </Button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            {t('dashboard.loading')}
                        </div>
                    ) : archivedHabits.length === 0 ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            {t('habits.archived.empty')}
                        </div>
                    ) : (
                        archivedHabits.map((habit: Habit) => (
                            <Card
                                key={habit.id}
                                className="opacity-60 hover:opacity-80 transition-opacity"
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'flex h-10 w-10 items-center justify-center rounded-full',
                                                getHabitColor(habit)
                                            )}
                                        >
                                            <span className="text-xl">{habit.icon || '🎯'}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">{habit.title}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {t('habits.archived.archivedOn', {
                                                    date: formatDate(habit.archived_at),
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
