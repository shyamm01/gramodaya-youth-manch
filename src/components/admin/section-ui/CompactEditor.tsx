'use client';

import React from 'react';

/**
 * The small edit dialog the record sections share.
 *
 * AdminPanel carried seven copies of this markup — grievance, initiative,
 * announcement, event, gallery, elder, village — identical down to the
 * `backdrop-blur-xs` and the button colours, each with its own close handler
 * and its own message banner. They had already drifted: some said "Save
 * Changes", the dark background was `#141417` in five and `#121215` in two.
 */
export const CompactEditor: React.FC<{
  title: string;
  message?: string;
  busy?: boolean;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}> = ({ title, message, busy, submitLabel = 'Save Changes', onClose, onSubmit, children }) => (
  <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          ✕
        </button>
      </div>

      {message && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 disabled:opacity-60 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
          >
            {busy ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
);

/** Field chrome the compact editors share. */
export const editorFieldClass =
  'w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white';

export const editorLabelClass =
  'text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1';

/** Label + control, the shape every field in these editors takes. */
export const EditorField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className={editorLabelClass}>{label}</label>
    {children}
  </div>
);
