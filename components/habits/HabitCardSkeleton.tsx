'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * HabitCardSkeleton component
 * 
 * Displays a skeleton loader that mimics the structure of HabitCard
 * Used while habits are loading to provide better UX
 */
export function HabitCardSkeleton() {
  return (
    <Card className="relative">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Circle skeleton */}
          <Skeleton className="h-12 w-12 rounded-full" />
          
          {/* Text content skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

