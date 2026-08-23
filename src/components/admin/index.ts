'use client';

/**
 * Admin panel components, grouped by what they are rather than by the prefix
 * on their filename:
 *
 *   layout/      the chrome around every admin screen
 *   widgets/     dashboard cards, charts and pickers
 *   sections/    whole screens for one module
 *   section-ui/  the shared kit those screens are built from
 */
export * from './layout/AdminLayout';
export * from './layout/AdminNavbar';
export * from './layout/AdminSidebar';

export * from './widgets/AdminMetricsCards';
export * from './widgets/AdminActivityChart';
export * from './widgets/AdminMemberTrendChart';
export * from './widgets/AdminLocationSelector';
export * from './widgets/AdminQuickCreateModal';

export * from './sections/AdminHelpdeskSection';
export * from './sections/AdminEducationSection';
export * from './permissions/AdminPermissionsSection';

export * from './section-ui';
