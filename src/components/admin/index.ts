'use client';

/**
 * Admin panel components, grouped by what they are rather than by the prefix
 * on their filename:
 *
 *   layout/      the chrome and route gate around every admin screen
 *   access/      which role or permission opens which screen
 *   hooks/       the per-section state hook
 *   widgets/     dashboard cards, charts and pickers
 *   section-ui/  the shared kit the screens are built from
 *
 * Everything else is one directory per module — members/, grievances/,
 * events/ and so on — each holding the screen its route renders plus the
 * editors that screen opens. One route, one directory, one bundle.
 */
export * from './layout/AdminLayout';
export * from './layout/AdminNavbar';
export * from './layout/AdminSidebar';
export * from './layout/AdminUnauthorizedSection';

export * from './widgets/AdminMetricsCards';
export * from './widgets/AdminActivityChart';
export * from './widgets/AdminMemberTrendChart';
export * from './widgets/AdminLocationSelector';
export * from './widgets/AdminQuickCreateModal';

export * from './layout/AdminShell';
export * from './access/adminAccessPolicy';
export * from './hooks/useAdminSection';

export * from './dashboard/AdminDashboardSection';
export * from './members/AdminMembersSection';
export * from './grievances/AdminGrievancesSection';
export * from './social-work/AdminSocialWorkSection';
export * from './announcements/AdminAnnouncementsSection';
export * from './events/AdminEventsSection';
export * from './villages/AdminVillagesSection';
export * from './gallery/AdminGallerySection';
export * from './elders/AdminEldersSection';
export * from './settings/AdminSettingsSection';

export * from './sections/AdminHelpdeskSection';
export * from './sections/AdminEducationSection';
export * from './permissions/AdminPermissionsSection';
export * from './modules/AdminModulesSection';
export * from './roles/AdminRolesSection';
export * from './audit/AdminAuditSection';

export * from './section-ui';
