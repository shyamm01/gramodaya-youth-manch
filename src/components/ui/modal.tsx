'use client';

/**
 * Controlled modal built on the shadcn dialog primitives.
 *
 * The app opens dialogs from state (`isOpen` / `onClose`) rather than from a
 * trigger element, and passes a title and description as props. That is the
 * shape ~17 call sites already use, so it stays — what changed is what sits
 * underneath: Base UI's dialog, which brings the focus trap, Escape handling,
 * scroll locking and ARIA wiring the previous hand-rolled overlay lacked.
 *
 * For anything trigger-driven, use the primitives in ./dialog directly.
 */

import * as React from 'react';
import { cn } from '@/src/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';

const maxWidthMap = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  full: 'sm:max-w-[95vw]',
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: keyof typeof maxWidthMap;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'lg',
}) => (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <DialogContent
      className={cn(
        // Tall editors are common in the admin panel, so the body scrolls
        // inside the modal rather than pushing it off-screen.
        'max-h-[calc(100dvh-4rem)] overflow-y-auto p-5 sm:p-6',
        maxWidthMap[maxWidth],
        className
      )}
    >
      {(title || description) && (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      {children}
    </DialogContent>
  </Dialog>
);
