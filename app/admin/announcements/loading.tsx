import React from 'react';
import { AnnouncementsSkeleton } from '@/src/components/admin/announcements/AnnouncementsSkeleton';

/** Route-level placeholder — see the component for why it is shaped this way. */
export default function AdminAnnouncementsLoading() {
  return <AnnouncementsSkeleton />;
}
