'use client';

import React, { useCallback, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/src/components/ui/alert';

export interface SectionNotice {
  type: 'ok' | 'error';
  text: string;
}

/** Result of the last action, on the shadcn <Alert>. */
export const NoticeBanner: React.FC<{ notice: SectionNotice | null }> = ({ notice }) => {
  if (!notice) return null;
  const ok = notice.type === 'ok';
  return (
    <Alert variant={ok ? 'default' : 'destructive'}>
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      <AlertDescription className="font-bold">{notice.text}</AlertDescription>
    </Alert>
  );
};

/**
 * One notice line per section, cleared on a timer.
 *
 * The timer is tracked so a second action does not inherit the first one's
 * countdown and blank its own message early.
 */
export function useSectionNotice(timeoutMs = 4000) {
  const [notice, setNotice] = useState<SectionNotice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback(
    (type: SectionNotice['type'], text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setNotice({ type, text });
      timer.current = setTimeout(() => setNotice(null), timeoutMs);
    },
    [timeoutMs]
  );

  return { notice, flash };
}
