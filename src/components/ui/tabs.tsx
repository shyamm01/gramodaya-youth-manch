'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}) => {
  const [tab, setTab] = React.useState(defaultValue);
  const activeTab = value !== undefined ? value : tab;

  const setActiveTab = (val: string) => {
    if (value === undefined) setTab(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-xl bg-[#F0EDE4] dark:bg-slate-800/80 p-1 text-[#8C8675] dark:text-slate-400 border border-[#E0DCCF] dark:border-slate-700/60',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    if (!ctx) throw new Error('TabsTrigger must be used within Tabs');

    const isActive = ctx.activeTab === value;

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => ctx.setActiveTab(value)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          isActive
            ? 'bg-white dark:bg-[#131B2E] text-[#2C3327] dark:text-white shadow-2xs'
            : 'text-[#8C8675] dark:text-slate-400 hover:text-[#2C3327] dark:hover:text-slate-200',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    if (!ctx) throw new Error('TabsContent must be used within Tabs');

    if (ctx.activeTab !== value) return null;

    return (
      <div
        ref={ref}
        className={cn('mt-3 focus-visible:outline-none animate-fade-in', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';
