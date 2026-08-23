/**
 * Class strings shared by the admin sections.
 *
 * These exist because the sections predate the shadcn primitives and still
 * carry a lot of hand-written markup — inputs and cards inside forms that have
 * not been converted to <Input> / <Card> yet. Naming the strings here keeps
 * those places consistent with the converted ones, and gives the remaining
 * conversion a single thing to delete when it is done.
 */
export const adminInputClass =
  'w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition';

export const adminLabelClass =
  'block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

export const adminCardClass =
  'bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-2xl shadow-xs transition-colors';
