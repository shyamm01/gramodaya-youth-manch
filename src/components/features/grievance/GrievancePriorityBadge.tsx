'use client';

import React from 'react';
import { ComplaintPriority } from '../../../types';

const PRIORITY_CONFIG: Record<ComplaintPriority, { label: string; labelHindi: string; color: string; bg: string; border: string; dot: string }> = {
  low: {
    label: 'Low',
    labelHindi: 'कम',
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-400',
  },
  medium: {
    label: 'Medium',
    labelHindi: 'मध्यम',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-400',
  },
  high: {
    label: 'High',
    labelHindi: 'उच्च',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  urgent: {
    label: 'Urgent',
    labelHindi: 'अत्यावश्यक',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

interface GrievancePriorityBadgeProps {
  priority: ComplaintPriority;
  lang?: string;
  size?: 'xs' | 'sm';
}

export const GrievancePriorityBadge: React.FC<GrievancePriorityBadgeProps> = ({
  priority = 'medium',
  lang = 'hi',
  size = 'xs',
}) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const label = lang === 'en' ? config.label : config.labelHindi;
  const textSize = size === 'xs' ? 'text-[9px]' : 'text-[10px]';
  const padding = size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 ${padding} ${textSize} font-bold rounded-md border ${config.color} ${config.bg} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${priority === 'urgent' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
};
