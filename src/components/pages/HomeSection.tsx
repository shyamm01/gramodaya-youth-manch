"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { JoinModal } from "../modals/JoinModal";
import {
  HomeHero,
  HomeMemberSearch,
  HomeGrievanceBanner,
  HomeLeadership,
  HomeActivityFeeds,
} from "../features/home";

export const HomeSection: React.FC = () => {
  const {
    members,
    complaints,
    socialWorks,
    publicInfos,
    events,
    gallery,
    admins,
    isJoinModalOpen,
    setIsJoinModalOpen,
  } = useApp();

  // Filtered dataset for widgets
  const approvedInfos = publicInfos.filter((p) => p.status === "approved");
  const approvedSocialWorks = socialWorks.filter(
    (s) => s.status === "approved" || s.status === "published",
  );
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED");
  const approvedGalleryPhotos = gallery.filter((g) => g.status === "published");

  const activeMembersCount = members.filter(
    (m) => m.status === "active",
  ).length;
  const resolvedComplaintsCount = complaints.filter(
    (c) => c.status === "RESOLVED",
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 transition-colors duration-200">
      {/* Join Organization Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      {/* 1. Hero Section with Blended Village Image & Live Metrics */}
      <HomeHero
        onJoinClick={() => setIsJoinModalOpen(true)}
        activeMembersCount={activeMembersCount}
        resolvedComplaintsCount={resolvedComplaintsCount}
        socialWorksCount={approvedSocialWorks.length}
        eventsCount={publishedEvents.length}
      />
      {/* 5. Live Activity Feeds (Notices, Social Work, Events, Gallery) */}
      <HomeActivityFeeds
        approvedInfos={approvedInfos}
        approvedSocialWorks={approvedSocialWorks}
        publishedEvents={publishedEvents}
        approvedGalleryPhotos={approvedGalleryPhotos}
      />

      {/* 2. Quick Member Directory Search & Actions */}
      <HomeMemberSearch
        members={members}
        activeMembersCount={activeMembersCount}
      />

      {/* 3. Grievance Redressal Banner */}
      <HomeGrievanceBanner
        complaints={complaints}
        resolvedComplaintsCount={resolvedComplaintsCount}
      />

      {/* 4. Leadership & Main Executives Showcase */}
      <HomeLeadership admins={admins} />
    </div>
  );
};
