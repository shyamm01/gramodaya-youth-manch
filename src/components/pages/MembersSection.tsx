"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { Member } from "../../types";
import { DigitalIdCard } from "../features/DigitalIdCard";
import { MemberChatModal } from "../modals/MemberChatModal";
import { JoinModal } from "../modals/JoinModal";
import {
  MemberHeaderBanner,
  MemberSearchFilter,
  MemberPendingBanner,
  MemberCard,
  MemberPhotoModal,
} from "../features/members";
import { Users } from "lucide-react";

export const MembersSection: React.FC = () => {
  const {
    t,
    members,
    fetchMembers,
    addMember,
    authSession,
    uploadPhoto,
    approveMember,
    deleteMember,
    selectedIdCardMember,
    setSelectedIdCardMember,
    selectedChatPartner,
    setSelectedChatPartner,
    currentMemberMobile,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "WITH_PHOTO" | "PENDING"
  >("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false);
  const [photoModalMember, setPhotoModalMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const activeMembers = useMemo(
    () => members.filter((m) => m.status === "active"),
    [members],
  );
  const pendingMembers = useMemo(
    () => members.filter((m) => m.status === "pending"),
    [members],
  );
  const membersWithPhoto = useMemo(
    () => activeMembers.filter((m) => Boolean(m.photoUrl)),
    [activeMembers],
  );

  // Identify current logged in member
  const currentLoggedInMember = useMemo(() => {
    if (!currentMemberMobile) return null;
    const cleanCurr = currentMemberMobile.replace(/\D/g, "").slice(-10);
    if (!cleanCurr || cleanCurr.length < 10) return null;
    return activeMembers.find((m) => {
      const cleanM = (m.mobile || "").replace(/\D/g, "").slice(-10);
      return cleanM && cleanM.length >= 10 && cleanM === cleanCurr;
    });
  }, [activeMembers, currentMemberMobile]);

  // Direct ID Card opening handler
  const handleOpenMyIdCardDirectly = () => {
    if (currentLoggedInMember) {
      setSelectedIdCardMember(currentLoggedInMember);
    } else if (activeMembers.length > 0) {
      setSelectedIdCardMember(activeMembers[0]);
    }
  };

  const handleApprove = async (id: string) => {
    await approveMember(id);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    await deleteMember(id);
    fetchMembers();
  };

  const handleSavePhoto = async (photoUrl: string) => {
    if (photoModalMember) {
      await uploadPhoto("member", photoModalMember.id, photoUrl);
      setPhotoModalMember(null);
      fetchMembers();
    }
  };

  const filteredMembers = useMemo(() => {
    let list = activeMembers;
    if (activeFilter === "WITH_PHOTO") {
      list = membersWithPhoto;
    } else if (activeFilter === "PENDING") {
      list = pendingMembers;
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase().trim();
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.mobile && m.mobile.includes(term)) ||
        (m.villageName && m.villageName.toLowerCase().includes(term)) ||
        (m.designation && m.designation.toLowerCase().includes(term)),
    );
  }, [
    activeMembers,
    membersWithPhoto,
    pendingMembers,
    activeFilter,
    searchTerm,
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 transition-colors duration-200">
      {/* 1. Header Banner & Action CTAs */}
      <MemberHeaderBanner
        activeMembersCount={activeMembers.length}
        onOpenIdCard={handleOpenMyIdCardDirectly}
        onOpenChat={() => setIsGeneralChatOpen(true)}
        onOpenAddMember={() => setIsAddModalOpen(true)}
        isAdminLoggedIn={authSession.isAdminLoggedIn}
      />

      {/* 2. Search & Filter Bar */}
      <MemberSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeCount={activeMembers.length}
        withPhotoCount={membersWithPhoto.length}
        pendingCount={pendingMembers.length}
        isAdminLoggedIn={authSession.isAdminLoggedIn}
      />

      {/* 3. Pending Approvals Banner (Admin view) */}
      {authSession.isAdminLoggedIn && pendingMembers.length > 0 && (
        <MemberPendingBanner
          pendingMembers={pendingMembers}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onViewAll={() => setActiveFilter("PENDING")}
        />
      )}

      {/* 4. Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#F8F6F0] dark:bg-[#111726] border border-dashed border-[#E0DCCF] dark:border-slate-800">
          <Users className="w-10 h-10 mx-auto text-[#A59F8E] dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-[#2C3327] dark:text-white">
            {searchTerm
              ? "कोई सदस्य नहीं मिला"
              : "कोई सक्रिय सदस्य उपलब्ध नहीं है"}
          </h3>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1 max-w-md mx-auto">
            {searchTerm
              ? `"${searchTerm}" के लिए कोई परिणाम नहीं मिला। कृपया दूसरा नाम या मोबाइल नंबर खोजें।`
              : 'ग्रामोदय यूथ मंच से जुड़ने के लिए ऊपर दिए गए "मंच से जुड़ें" बटन पर क्लिक करें।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onSelectIdCard={() => setSelectedIdCardMember(member)}
              onSelectChat={() => setSelectedChatPartner(member)}
            />
          ))}
        </div>
      )}

      {/* 5. Modals */}
      <JoinModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          fetchMembers();
        }}
      />

      {selectedIdCardMember && (
        <DigitalIdCard
          member={selectedIdCardMember}
          onClose={() => setSelectedIdCardMember(null)}
        />
      )}

      {selectedChatPartner && (
        <MemberChatModal
          initialPartner={selectedChatPartner}
          onClose={() => setSelectedChatPartner(null)}
        />
      )}

      {isGeneralChatOpen && (
        <MemberChatModal
          initialPartner={null}
          onClose={() => setIsGeneralChatOpen(false)}
        />
      )}

      {photoModalMember && (
        <MemberPhotoModal
          member={photoModalMember}
          onClose={() => setPhotoModalMember(null)}
          onSave={handleSavePhoto}
        />
      )}
    </div>
  );
};
