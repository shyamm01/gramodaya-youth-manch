'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`${compact ? 'w-6 h-6' : 'w-7 h-7'} rounded-xl bg-[#F0EDE4] dark:bg-slate-800/80 border border-[#D5CFBF] dark:border-slate-700 animate-pulse`}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`${compact ? 'p-1' : 'p-1.5'} rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#F0EDE4] hover:bg-[#E4DFD3] dark:bg-slate-800/90 dark:hover:bg-slate-800 text-[#2C3327] dark:text-slate-200 border border-[#D5CFBF] dark:border-slate-700 shadow-2xs flex items-center justify-center active:scale-95`}
      title={isDark ? 'लाइट मोड चालू करें (Switch to Light Mode)' : 'डार्क मोड चालू करें (Switch to Dark Mode)'}
      aria-label="Toggle Dark/Light Mode"
    >
      {isDark ? (
        <Sun className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90`} />
      ) : (
        <Moon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#2C3327] transition-transform duration-300 rotate-0 hover:-rotate-12`} />
      )}
    </button>
  );
};
