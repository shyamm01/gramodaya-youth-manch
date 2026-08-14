'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full border border-[#E0DCCF] dark:border-slate-700 bg-[#F0EDE4] dark:bg-slate-800 text-[#2C3327] dark:text-white font-bold items-center justify-center shadow-2xs',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt, ...props }, ref) => (
  <img
    ref={ref}
    alt={alt}
    className={cn('aspect-square h-full w-full object-cover', className)}
    onError={(e) => {
      (e.target as HTMLElement).style.display = 'none';
    }}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-[#E8F2EC] dark:bg-emerald-950 text-[#1E3A2F] dark:text-emerald-300 font-black',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';
