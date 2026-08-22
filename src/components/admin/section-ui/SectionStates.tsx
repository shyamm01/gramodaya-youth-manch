'use client';

import React from 'react';
import { Card } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { cn } from '@/src/lib/utils';

/** Stands in for a list with nothing in it, so an empty section reads as
 *  "nothing here yet" rather than as a section that failed to load. */
export const EmptyState: React.FC<{ message: string; className?: string }> = ({
  message,
  className,
}) => (
  <Card
    className={cn(
      'border-dashed p-10 text-center text-xs text-muted-foreground shadow-none',
      className
    )}
  >
    {message}
  </Card>
);

/**
 * Placeholder shaped like the list it stands in for, so the layout does not
 * jump when the rows arrive.
 */
export const SectionSkeleton: React.FC<{ variant?: 'cards' | 'table'; rows?: number }> = ({
  variant = 'cards',
  rows = 6,
}) => {
  if (variant === 'table') {
    return (
      <Card className="overflow-hidden p-0">
        <div className="bg-muted/50 px-4 py-3 flex items-center gap-4">
          {['w-24', 'w-20', 'w-16', 'w-14'].map((w) => (
            <Skeleton key={w} className={`h-2.5 ${w}`} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="px-4 py-3.5 flex items-center gap-4">
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-2.5 w-3/5" />
              </div>
              <Skeleton className="h-2.5 w-20 hidden sm:block" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: rows }).map((_, card) => (
        <Card key={card} className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-4/5" />
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
};
