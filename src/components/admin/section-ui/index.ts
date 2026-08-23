/**
 * The shared look of an admin section.
 *
 * The education module was built first and settled the pattern every other
 * section now follows: a header carrying the section's identity and its primary
 * actions, one notice line for the result of the last action, a filter bar,
 * then the list — with an empty state instead of blank space and a single
 * confirmation in front of anything destructive.
 *
 * The pieces live here, built on the shadcn primitives in components/ui, so the
 * sections cannot drift apart again: changing the card radius or the input
 * border is one edit, not twelve.
 */
export * from './tokens';
export * from './SectionShell';
export * from './SectionNotice';
export * from './SectionFilters';
export * from './SectionStates';
export * from './SectionDialogs';
export * from './CompactEditor';
export * from './SectionSkeletons';
