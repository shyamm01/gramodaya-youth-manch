'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';

export const FilterBar: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Card className={cn('p-3 flex flex-wrap items-center gap-2.5', className)}>{children}</Card>
);

export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <div className="relative flex-1 min-w-[200px]">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9"
    />
  </div>
);
