'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import {
  getOrCreateGroupRoom,
  getOrCreatePersonalRoom,
  sendRoomMessage,
  fetchRoomMessages,
  deleteChatMessage,
  markRoomMessagesAsRead,
  SupabaseMessage,
} from '../../lib/supabaseChat';
import { supabase } from '../../lib/supabase';
import {
  ChatHeaderBanner,
  ChatSidebar,
  ChatConversationHeader,
  ChatMessageList,
  ChatInputBar,
  ChatIdentityModal,
} from '../features/chat';

export const LiveChatSection: React.FC = () => {
  const {
    members,
    authSession,
    isApprovedMember,
    currentMemberMobile,
    setCurrentMemberMobile,
    setSelectedIdCardMember,
    selectedChatPartner,
    setSelectedChatPartner,
    fetchGroupChat,
    t,
    lang,
    villageSettings,
  } = useApp();

  // Active polling only when Live Chat screen is mounted
  useEffect(() => {
    fetchGroupChat();
    const interval = setInterval(() => {
      fetchGroupChat();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchGroupChat]);

  const activeMembers = members.filter((m) => m.status === 'active');

  // Identify logged in member / sender identity
  const [currentMobile, setCurrentMobile] = useState<string>(() => {
    return currentMemberMobile || (typeof window !== 'undefined' ? localStorage.getItem('gym_chat_sender_mobile') || '' : '');
  });

  const currentDigits = currentMobile ? currentMobile.replace(/\D/g, '').slice(-10) : '';
  const currentMemberObj = currentDigits.length >= 10
    ? activeMembers.find(
        (m) =>
          m.mobile &&
          m.mobile.replace(/\D/g, '').slice(-10) === currentDigits
      )
    : undefined;

  const [senderName, setSenderName] = useState(() => {
    if (authSession.isAdminLoggedIn && authSession.adminName) return authSession.adminName;
    if (currentMemberObj) return currentMemberObj.name;
    return typeof window !== 'undefined' ? localStorage.getItem('gym_chat_sender_name') || 'ग्रामोदय सदस्य' : 'ग्रामोदय सदस्य';
  });

  const [senderPhoto, setSenderPhoto] = useState(() => {
    if (currentMemberObj?.photoUrl) return currentMemberObj.photoUrl;
    return typeof window !== 'undefined' ? localStorage.getItem('gym_chat_sender_photo') || '' : '';
  });

  // Search filter for contacts
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Active Room ('group' | 'admin' | 'personal')
  const [activeTab, setActiveTab] = useState<'group' | 'admin' | 'personal'>(() => {
    return selectedChatPartner ? 'personal' : 'group';
  });
  const [activePartner, setActivePartner] = useState<Member | null>(() => {
    return selectedChatPartner || null;
  });

  // Chat messages and room state
  const [messages, setMessages] = useState<SupabaseMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Online Presence state
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  // Identity / Member Verification Modal State
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [mobileInput, setMobileInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Mobile layout state (Show Chat List vs Show Active Room)
  const [showMobileChatView, setShowMobileChatView] = useState(() => {
    return !!selectedChatPartner;
  });

  // Sync state if selectedChatPartner from context changes
  useEffect(() => {
    if (selectedChatPartner) {
      setActiveTab('personal');
      setActivePartner(selectedChatPartner);
      setShowMobileChatView(true);
    }
  }, [selectedChatPartner]);

  // Sync state if currentMemberObj or authSession changes
  useEffect(() => {
    const mob = currentMemberMobile || authSession.adminMobile || authSession.currentMember?.mobile;
    if (mob) {
      setCurrentMobile(mob);
    }
    if (currentMemberObj) {
      setSenderName(currentMemberObj.name);
      if (currentMemberObj.photoUrl) setSenderPhoto(currentMemberObj.photoUrl);
      localStorage.setItem('gym_chat_sender_mobile', currentMemberObj.mobile);
      localStorage.setItem('gym_chat_sender_name', currentMemberObj.name);
      if (currentMemberObj.photoUrl) {
        localStorage.setItem('gym_chat_sender_photo', currentMemberObj.photoUrl);
      }
    } else if (authSession.adminName) {
      setSenderName(authSession.adminName);
    }
  }, [currentMemberObj, currentMemberMobile, authSession]);

  // Determine current active Room ID
  const getActiveRoomId = () => {
    if (activeTab === 'group') {
      return 'common_group_room';
    }
    if (activeTab === 'admin') {
      const uDigits = (currentMobile || 'user').replace(/\D/g, '').slice(-10);
      return `room_admin_${uDigits}`;
    }
    if (activePartner && activePartner.mobile) {
      const uDigits = (currentMobile || 'user').replace(/\D/g, '').slice(-10);
      const pDigits = activePartner.mobile.replace(/\D/g, '').slice(-10);
      return `room_pv_${[uDigits, pDigits].sort().join('_')}`;
    }
    return 'common_group_room';
  };

  // Load Room Messages
  const loadRoomMessages = async () => {
    const roomId = getActiveRoomId();
    const msgs = await fetchRoomMessages(roomId);
    setMessages(msgs);
    if (currentMobile) {
      markRoomMessagesAsRead(roomId, currentMobile);
    }
  };

  // Setup Realtime Subscription for Active Room & Online Presence
  useEffect(() => {
    loadRoomMessages();

    const roomId = getActiveRoomId();

    // 1. Subscribe to Supabase Postgres Changes for chat_messages
    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadRoomMessages();
        }
      )
      .subscribe();

    // 2. Subscribe to Presence for Online Status
    const userKey = currentMobile
      ? currentMobile.replace(/\D/g, '').slice(-10)
      : `anon_${Math.random().toString(36).substring(7)}`;

    const presenceChannel = supabase.channel('online-presence', {
      config: { presence: { key: userKey } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineMap: Record<string, boolean> = {};
        Object.keys(state).forEach((key) => {
          onlineMap[key] = true;
        });
        setOnlineUsers(onlineMap);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            onlineAt: new Date().toISOString(),
            name: senderName,
            mobile: currentMobile,
          });
        }
      });

    // Polling fallback every 3.5 seconds
    const interval = setInterval(() => {
      loadRoomMessages();
    }, 3500);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
      clearInterval(interval);
    };
  }, [activeTab, activePartner, currentMobile]);

  // Handle Login as Member
  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!mobileInput.trim()) {
      setLoginError(lang === 'en' ? 'Please enter registered mobile number.' : 'कृपया अपना पंजीकृत मोबाइल नंबर दर्ज करें।');
      return;
    }

    const digits = mobileInput.replace(/\D/g, '').slice(-10);
    const found = activeMembers.find(
      (m) => m.mobile && m.mobile.replace(/\D/g, '').slice(-10) === digits
    );

    if (!found) {
      setLoginError(lang === 'en' ? 'Mobile number not found in active members list.' : 'यह नंबर सदस्य सूची में नहीं मिला। केवल स्वीकृत सदस्य संवाद कर सकते हैं।');
      return;
    }

    setCurrentMobile(found.mobile);
    setCurrentMemberMobile(found.mobile);
    setSenderName(found.name);
    if (found.photoUrl) setSenderPhoto(found.photoUrl);
    setIsIdentityModalOpen(false);
  };

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    if (!isApprovedMember) {
      setErrorMsg(
        lang === 'en'
          ? 'Your membership is pending approval. You can participate in chat once approved by an admin.'
          : 'आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है। एडमिन द्वारा अनुमोदन के बाद ही आप संदेश भेज सकेंगे।'
      );
      return;
    }

    if (!currentMobile && activeTab !== 'group') {
      setErrorMsg(lang === 'en' ? 'Please confirm your member identity first.' : 'कृपया पहले अपनी सदस्य पहचान दर्ज करें।');
      setIsIdentityModalOpen(true);
      return;
    }

    setSending(true);
    setErrorMsg('');

    const roomId = getActiveRoomId();
    const myMobile = currentMobile || '+91 9999999999';
    const myName = senderName || (lang === 'en' ? 'Member' : 'ग्रामोदय सदस्य');
    const myPhoto = senderPhoto || '';

    const mIdx = activeMembers.findIndex(
      (m) =>
        m.mobile &&
        m.mobile.replace(/\D/g, '').slice(-10) === myMobile.replace(/\D/g, '').slice(-10)
    );
    const memberIdCode = mIdx >= 0 ? `GYM-${String(mIdx + 1).padStart(6, '0')}` : 'GYM-MEM';

    const textToSend = messageText.trim();
    setMessageText('');

    if (activeTab === 'group') {
      await getOrCreateGroupRoom();
    } else if (activeTab === 'admin') {
      await getOrCreatePersonalRoom(myMobile, '+91 9876543210', myName, 'ग्रामोदय एडमिन', 'admin');
    } else if (activePartner) {
      await getOrCreatePersonalRoom(
        myMobile,
        activePartner.mobile,
        myName,
        activePartner.name,
        'personal'
      );
    }

    const res = await sendRoomMessage(roomId, myMobile, myName, myPhoto, textToSend, memberIdCode);
    setSending(false);

    if (res.success) {
      await loadRoomMessages();
    } else {
      setErrorMsg(res.error || (lang === 'en' ? 'Failed to send message.' : 'संदेश भेजने में विफल। नेटवर्क जांचें।'));
    }
  };

  const handleQuickSend = (phrase: string) => {
    setMessageText(phrase);
  };

  // Handle Delete Message
  const handleDeleteMessage = async (msgId: string) => {
    const res = await deleteChatMessage(
      msgId,
      currentMobile || '',
      authSession.isAdminLoggedIn
    );

    if (res.success) {
      await loadRoomMessages();
    } else {
      alert(res.error || (lang === 'en' ? 'Could not delete message.' : 'संदेश नहीं हटाया जा सका।'));
    }
  };

  // Search Filtered Members
  const filteredMembers = activeMembers.filter((m) => {
    if (currentMemberObj && m.id === currentMemberObj.id) return false;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const mIdx = activeMembers.findIndex((x) => x.id === m.id);
    const memberId = `GYM-${String(mIdx + 1).padStart(6, '0')}`.toLowerCase();

    return (
      m.name.toLowerCase().includes(term) ||
      m.mobile.includes(term) ||
      memberId.includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 space-y-4 font-sans transition-colors duration-200">
      {/* 1. TOP HEADER BANNER */}
      <ChatHeaderBanner
        senderName={senderName}
        currentMemberObj={currentMemberObj}
        activeMembersCount={activeMembers.length}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
        onRefresh={loadRoomMessages}
        lang={lang}
        orgName={villageSettings.orgName}
        orgNameHindi={villageSettings.orgNameHindi}
      />

      {/* 2. MAIN CHAT CONTAINER */}
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-[#E0DCCF] dark:border-slate-800 shadow-xl overflow-hidden min-h-[580px] max-h-[750px] flex flex-col md:flex-row transition-colors">
        {/* LEFT SIDEBAR */}
        <ChatSidebar
          senderName={senderName}
          senderPhoto={senderPhoto}
          currentMemberObj={currentMemberObj}
          activeMembers={activeMembers}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          activePartner={activePartner}
          filteredMembers={filteredMembers}
          onlineUsers={onlineUsers}
          onSelectGroup={() => {
            setActiveTab('group');
            setActivePartner(null);
            setSelectedChatPartner(null);
            setShowMobileChatView(true);
          }}
          onSelectAdmin={() => {
            setActiveTab('admin');
            setActivePartner(null);
            setSelectedChatPartner(null);
            setShowMobileChatView(true);
          }}
          onSelectMember={(m) => {
            setActiveTab('personal');
            setActivePartner(m);
            setSelectedChatPartner(m);
            setShowMobileChatView(true);
          }}
          onSelectIdCard={setSelectedIdCardMember}
          showMobileChatView={showMobileChatView}
          lang={lang}
          villagePanchayat={villageSettings.gramPanchayat}
          villagePanchayatHindi={villageSettings.gramPanchayatHindi}
          idCardLabel={t('common.idCard')}
        />

        {/* RIGHT MAIN CHAT WINDOW */}
        <div
          className={`flex-1 flex flex-col bg-[#F7F5F0] dark:bg-[#0B0F17] ${
            !showMobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Active Chat Header */}
          <ChatConversationHeader
            activeTab={activeTab}
            activePartner={activePartner}
            activeMembersCount={activeMembers.length}
            isOnline={activePartner ? !!onlineUsers[activePartner.mobile.replace(/\D/g, '').slice(-10)] : false}
            onBackToContacts={() => setShowMobileChatView(false)}
            onSelectIdCard={setSelectedIdCardMember}
            lang={lang}
            idCardLabel={t('common.idCard')}
            callLabel={t('common.call')}
            whatsappLabel={t('common.whatsapp')}
          />

          {/* Messages Thread (contained scrolling without window jerking) */}
          <ChatMessageList
            messages={messages}
            currentMobile={currentMobile}
            isAdminLoggedIn={authSession.isAdminLoggedIn}
            activeTab={activeTab}
            onDeleteMessage={handleDeleteMessage}
            lang={lang}
          />

          {/* Message Input Bar */}
          <ChatInputBar
            messageText={messageText}
            senderName={senderName}
            sending={sending}
            errorMsg={errorMsg}
            onMessageChange={setMessageText}
            onSendMessage={handleSendMessage}
            onQuickSend={handleQuickSend}
            lang={lang}
          />
        </div>
      </div>

      {/* 3. IDENTITY SELECTOR MODAL */}
      <ChatIdentityModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        mobileInput={mobileInput}
        onMobileInputChange={setMobileInput}
        onSubmit={handleMemberLogin}
        loginError={loginError}
        activeMembers={activeMembers}
        onSelectMember={(m) => {
          setCurrentMobile(m.mobile);
          setCurrentMemberMobile(m.mobile);
          setSenderName(m.name);
          if (m.photoUrl) setSenderPhoto(m.photoUrl);
          setIsIdentityModalOpen(false);
        }}
        lang={lang}
        villageName={villageSettings.name}
        villageNameHindi={villageSettings.nameHindi}
      />
    </div>
  );
};
