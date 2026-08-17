'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchHomeStats,
  fetchHomeAnnouncements,
  fetchHomeEvents,
  fetchHomeSocialWork,
  fetchHomeGallery,
} from '../../store/slices/homeSlice';
import { InviteMemberModal } from '../modals/InviteMemberModal';
import {
  HomeHero,
  HomeMemberSearch,
  HomeGrievanceBanner,
  HomeLeadership,
  HomeActivityFeeds,
} from '../features/home';

export const HomeSection: React.FC = () => {
  const { members, complaints, socialWorks, events, gallery, admins, announcements, authSession } = useApp();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const stats = useAppSelector((state) => state.home.stats);
  const announcementsCard = useAppSelector((state) => state.home.announcements);
  const eventsCard = useAppSelector((state) => state.home.events);
  const socialWorkCard = useAppSelector((state) => state.home.socialWork);
  const galleryCard = useAppSelector((state) => state.home.gallery);

  const isLoggedIn = Boolean(
    authSession.isMemberLoggedIn || authSession.isAdminLoggedIn || authSession.supabaseUserId
  );

  // Every card on this page fetches from a generic, village-scoped API (also
  // used elsewhere in the app) and owns its own loading/error state — a slow
  // gallery query no longer blocks the notices card from showing, and one
  // card failing doesn't fail the page. Dedup against StrictMode's dev-mode
  // double-invoke happens inside each thunk's `condition`, not here.
  useEffect(() => {
    dispatch(fetchHomeStats());
    dispatch(fetchHomeAnnouncements());
    dispatch(fetchHomeEvents());
    dispatch(fetchHomeSocialWork());
    dispatch(fetchHomeGallery());
  }, [dispatch]);

  const activeMembersCount =
    stats.data?.stats?.activeMembers ?? members.filter((m) => m.status === 'active').length;
  const resolvedComplaintsCount =
    stats.data?.stats?.resolvedComplaints ?? complaints.filter((c) => c.status === 'RESOLVED').length;
  const newComplaintsCount =
    stats.data?.stats?.newComplaints ?? complaints.filter((c) => c.status === 'NEW').length;

  const socialWorksList =
    socialWorkCard.data?.socialWorks ??
    socialWorks.filter((s) => s.status === 'approved' || s.status === 'published');
  const eventsList =
    eventsCard.data?.events ??
    events.filter((e) => e.status === 'PUBLISHED' || (e.status as string) === 'upcoming');
  const galleryList = galleryCard.data?.gallery ?? gallery.filter((g) => g.status === 'published');
  const announcementsList = announcementsCard.data?.announcements ?? announcements;

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 transition-colors duration-200">
      {/* Invite / Add Member Modal for logged in users */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* 1. Hero Section - Full width dynamic banner & live stats */}
      <HomeHero
        isLoggedIn={isLoggedIn}
        onAddMemberClick={() => setIsInviteModalOpen(true)}
        activeMembersCount={activeMembersCount}
        resolvedComplaintsCount={resolvedComplaintsCount}
        socialWorksCount={socialWorksList.length}
        eventsCount={eventsList.length}
        statsLoading={stats.status === 'loading' && !stats.data}
      />

      {/* 2. Containerized Dynamic Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Live Activity Feeds (Announcements, Social Work, Events, Gallery) — each card independent */}
        <HomeActivityFeeds
          announcements={announcementsList}
          announcementsLoading={announcementsCard.status === 'loading' && !announcementsCard.data}
          approvedInfos={[]}
          approvedSocialWorks={socialWorksList}
          socialWorkLoading={socialWorkCard.status === 'loading' && !socialWorkCard.data}
          publishedEvents={eventsList}
          eventsLoading={eventsCard.status === 'loading' && !eventsCard.data}
          approvedGalleryPhotos={galleryList}
          galleryLoading={galleryCard.status === 'loading' && !galleryCard.data}
        />

        {/* Quick Member Directory Search & Actions */}
        <HomeMemberSearch
          members={members}
          activeMembersCount={activeMembersCount}
        />

        {/* Grievance Redressal Banner */}
        <HomeGrievanceBanner
          newComplaintsCount={newComplaintsCount}
          resolvedComplaintsCount={resolvedComplaintsCount}
          loading={stats.status === 'loading' && !stats.data}
        />

        {/* Leadership & Main Executives Showcase */}
        <HomeLeadership admins={admins} />
      </div>
    </div>
  );
};
