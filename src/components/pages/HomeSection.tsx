'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JoinModal } from '../modals/JoinModal';
import {
  HomeHero,
  HomeMemberSearch,
  HomeGrievanceBanner,
  HomeLeadership,
  HomeActivityFeeds,
} from '../features/home';

export const HomeSection: React.FC = () => {
  const {
    members,
    complaints,
    socialWorks,
    events,
    gallery,
    admins,
    announcements,
    activeVillageId,
    isJoinModalOpen,
    setIsJoinModalOpen,
  } = useApp();

  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch dynamic page-specific data from /api/home
  useEffect(() => {
    let isMounted = true;
    const fetchHomeFeed = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/home?villageId=${encodeURIComponent(activeVillageId || '1')}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success) {
            setHomeData(json);
          }
        }
      } catch (err) {
        console.warn('Could not fetch home API feed, using context fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeFeed();
    return () => {
      isMounted = false;
    };
  }, [activeVillageId]);

  // Merge dynamic API feeds with fallback context datasets
  const activeMembersCount =
    homeData?.stats?.activeMembers ?? members.filter((m) => m.status === 'active').length;
  const resolvedComplaintsCount =
    homeData?.stats?.resolvedComplaints ??
    complaints.filter((c) => c.status === 'RESOLVED').length;
  const socialWorksList =
    homeData?.recentSocialWorks ??
    socialWorks.filter((s) => s.status === 'approved' || s.status === 'published');
  const eventsList =
    homeData?.upcomingEvents ??
    events.filter((e) => e.status === 'PUBLISHED' || (e.status as string) === 'upcoming');
  const galleryList =
    homeData?.galleryHighlights ??
    gallery.filter((g) => g.status === 'published');
  const announcementsList =
    homeData?.announcements ?? announcements;

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 transition-colors duration-200">
      {/* Join Organization Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      {/* 1. Hero Section - Full width dynamic banner & live stats */}
      <HomeHero
        onJoinClick={() => setIsJoinModalOpen(true)}
        activeMembersCount={activeMembersCount}
        resolvedComplaintsCount={resolvedComplaintsCount}
        socialWorksCount={socialWorksList.length}
        eventsCount={eventsList.length}
      />

      {/* 2. Containerized Dynamic Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Live Activity Feeds (Announcements, Social Work, Events, Gallery) */}
        <HomeActivityFeeds
          announcements={announcementsList}
          approvedInfos={[]}
          approvedSocialWorks={socialWorksList}
          publishedEvents={eventsList}
          approvedGalleryPhotos={galleryList}
        />

        {/* Quick Member Directory Search & Actions */}
        <HomeMemberSearch
          members={members}
          activeMembersCount={activeMembersCount}
        />

        {/* Grievance Redressal Banner */}
        <HomeGrievanceBanner
          complaints={homeData?.recentComplaints || complaints}
          resolvedComplaintsCount={resolvedComplaintsCount}
        />

        {/* Leadership & Main Executives Showcase */}
        <HomeLeadership admins={admins} />
      </div>
    </div>
  );
};
