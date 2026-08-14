'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { DigitalIdCard } from '../features/DigitalIdCard';
import { MemberChatModal } from '../modals/MemberChatModal';
import {
  MemberHeaderBanner,
  MemberSearchFilter,
  MemberPendingBanner,
  MemberCard,
  MemberPhotoModal,
  MemberAddModal,
} from '../features/members';
import { Card, Button } from '../ui';
import { Users } from 'lucide-react';

export const MembersSection: React.FC = () => {
  const {
    t,
    members,
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

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WITH_PHOTO' | 'PENDING'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false);
  const [photoModalMember, setPhotoModalMember] = useState<Member | null>(null);

  const activeMembers = useMemo(() => members.filter((m) => m.status === 'active'), [members]);
  const pendingMembers = useMemo(() => members.filter((m) => m.status === 'pending'), [members]);
  const membersWithPhoto = useMemo(() => activeMembers.filter((m) => Boolean(m.photoUrl)), [activeMembers]);

  // Identify current logged in member
  const currentLoggedInMember = useMemo(() => {
    if (!currentMemberMobile) return null;
    const cleanCurr = currentMemberMobile.replace(/\D/g, '').slice(-10);
    if (!cleanCurr || cleanCurr.length < 10) return null;
    return activeMembers.find((m) => {
      const cleanM = (m.mobile || '').replace(/\D/g, '').slice(-10);
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

  const filteredMembers = useMemo(() => {
    let list = activeMembers;
    if (activeFilter === 'WITH_PHOTO') {
      list = membersWithPhoto;
    } else if (activeFilter === 'PENDING') {
      list = pendingMembers;
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase().trim();
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.mobile && m.mobile.includes(term))
    );
  }, [activeMembers, membersWithPhoto, pendingMembers, activeFilter, searchTerm]);

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-6 transition-colors duration-200">
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

      {/* 3. Pending Review Banner for Admin */}
      {authSession.isAdminLoggedIn && activeFilter !== 'PENDING' && (
        <MemberPendingBanner
          pendingMembers={pendingMembers}
          onApprove={approveMember}
          onDelete={deleteMember}
          onViewAll={() => setActiveFilter('PENDING')}
        />
      )}

      {/* 4. Active Member Directory Grid */}
      {filteredMembers.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border border-dashed border-[#E0DCCF] dark:border-slate-800 bg-white dark:bg-[#111726]">
          <Users className="w-10 h-10 mx-auto text-[#A59F8E] dark:text-slate-600 mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-[#2C3327] dark:text-white">
            {t('members.noMembersTitle')}
          </h3>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? (t('common.village') === 'Village' ? `No records found matching "${searchTerm}".` : `"${searchTerm}" से संबंधित कोई रिकॉर्ड नहीं मिला।`)
              : t('members.noMembersDescription')}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="mt-4 text-xs"
            >
              {t('common.resetSearch')}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onSelectIdCard={setSelectedIdCardMember}
              onSelectChat={setSelectedChatPartner}
            />
          ))}
        </div>
      )}

      {/* 5. Add Member Modal */}
      <MemberAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={addMember}
        isAdminLoggedIn={authSession.isAdminLoggedIn}
      />

      {/* 6. Photo Upload Modal */}
      <MemberPhotoModal
        member={photoModalMember}
        onClose={() => setPhotoModalMember(null)}
        onSave={async (photoUrl) => {
          if (photoModalMember) {
            await uploadPhoto('member', photoModalMember.id, photoUrl);
          }
        }}
      />

      {/* 7. Digital ID Card Modal */}
      {selectedIdCardMember && (
        <DigitalIdCard
          member={selectedIdCardMember}
          onClose={() => setSelectedIdCardMember(null)}
        />
      )}

      {/* 8. Member Chat Modal */}
      {(selectedChatPartner || isGeneralChatOpen) && (
        <MemberChatModal
          initialPartner={selectedChatPartner}
          onClose={() => {
            setSelectedChatPartner(null);
            setIsGeneralChatOpen(false);
          }}
        />
      )}
    </div>
  );
};
