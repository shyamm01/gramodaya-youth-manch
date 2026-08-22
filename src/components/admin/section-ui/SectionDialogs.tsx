'use client';

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Modal } from '@/src/components/ui/modal';

export interface ConfirmTarget {
  title: string;
  label: string;
  run: () => void | Promise<unknown>;
}

/** One confirmation in front of every destructive action in the panel. */
export const ConfirmDialog: React.FC<{
  target: ConfirmTarget | null;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ target, busy, onCancel, onConfirm }) => (
  <Modal
    isOpen={Boolean(target)}
    onClose={() => !busy && onCancel()}
    title={target?.title}
    maxWidth="sm"
  >
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="font-bold text-foreground break-words">{target?.label}</span> will be
        removed permanently. This cannot be undone.
      </p>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={busy}
          className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700"
        >
          {busy ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </div>
  </Modal>
);

/** Modal wrapper for the create/edit editors each section opens from its header. */
export const EditorDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}> = ({ isOpen, onClose, title, description, children, maxWidth = 'xl' }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} maxWidth={maxWidth}>
    {children}
  </Modal>
);
