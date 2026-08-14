"use client";

import React from "react";
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
    <div className="space-y-8 sm:space-y-12 pb-16 transition-colors duration-200">
      {/* Join Organization Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      {/* 1. Hero Section - Full width seamlessly spanning with background image */}
      <HomeHero
        onJoinClick={() => setIsJoinModalOpen(true)}
        activeMembersCount={activeMembersCount}
        resolvedComplaintsCount={resolvedComplaintsCount}
        socialWorksCount={approvedSocialWorks.length}
        eventsCount={publishedEvents.length}
      />

      {/* 2. Containerized Content for all sections below Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Live Activity Feeds (Notices, Social Work, Events, Gallery) */}
        <HomeActivityFeeds
          approvedInfos={approvedInfos}
          approvedSocialWorks={approvedSocialWorks}
          publishedEvents={publishedEvents}
          approvedGalleryPhotos={approvedGalleryPhotos}
        />

        {/* Quick Member Directory Search & Actions */}
        <HomeMemberSearch
          members={members}
          activeMembersCount={activeMembersCount}
        />

        {/* Grievance Redressal Banner */}
        <HomeGrievanceBanner
          complaints={complaints}
          resolvedComplaintsCount={resolvedComplaintsCount}
        />

        {/* Leadership & Main Executives Showcase */}
        <HomeLeadership admins={admins} />
      </div>
    </div>
  );
};
