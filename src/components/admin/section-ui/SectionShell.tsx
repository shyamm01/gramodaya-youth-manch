'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

/** The outer wrapper every section shares, so vertical rhythm matches. */
export const SectionShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-6 animate-fade-in">{children}</div>
);

/**
 * Section identity on the left, actions on the right.
 *
 * `onRefresh` puts the refresh control in the same place in every section,
 * which is what makes them read as one panel rather than twelve screens.
 */
export const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  children?: React.ReactNode;
}> = ({ icon: Icon, title, description, onRefresh, refreshing, children }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-3xl">{description}</p>
    </div>

    <div className="flex items-center gap-2">
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      )}
      {children}
    </div>
  </div>
);
