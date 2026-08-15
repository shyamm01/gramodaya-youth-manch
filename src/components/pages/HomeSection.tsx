'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const inFlightControllerRef = useRef<AbortController | null>(null);
  const lastFetchedIdRef = useRef<string | null>(null);

  // Fetch dynamic page-specific data from /api/home (deduplicated & abort-safe)
  useEffect(() => {
    const targetVillageId = activeVillageId || '1';

    // Prevent duplicate fetch if already loaded for this village
    if (lastFetchedIdRef.current === targetVillageId && homeData) {
      return;
    }

    // Abort any pending in-flight request
    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
    }

    const controller = new AbortController();
    inFlightControllerRef.current = controller;

    const fetchHomeFeed = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/home?villageId=${encodeURIComponent(targetVillageId)}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && !controller.signal.aborted) {
            setHomeData(json);
            lastFetchedIdRef.current = targetVillageId;
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Could not fetch home API feed, using context fallback:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchHomeFeed();

    return () => {
      controller.abort();
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
