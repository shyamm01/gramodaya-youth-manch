'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/src/context/AppContext';
import {
  MessageSquare,
  Search,
  Send,
  User,
  ShieldCheck,
  Clock,
  CheckCheck,
  RefreshCw,
  Phone,
  ArrowLeft,
  Inbox,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { supabase } from '@/src/lib/supabase';
import { sendRoomMessage, playChatChime } from '@/src/lib/supabaseChat';

interface HelpdeskMessage {
  id: string;
  senderMobile: string;
  senderName: string;
  senderPhoto?: string;
  recipientMobile: string;
  recipientName: string;
  text: string;
  villageId?: string;
  createdAt: string;
  read?: boolean;
}

export const AdminHelpdeskSection: React.FC = () => {
  const { authSession, villageSettings, villages, lang } = useApp();
  const [messages, setMessages] = useState<HelpdeskMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('ALL');
  const [selectedCitizenMobile, setSelectedCitizenMobile] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch helpdesk messages from API
  const fetchHelpdeskMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messages?isAdmin=true', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          // Filter to helpdesk inquiries (where sender or recipient is ADMIN or tagged helpdesk)
          const helpdeskList = data.messages.filter(
            (m: any) =>
              m.recipientMobile === 'ADMIN' ||
              m.senderMobile === 'ADMIN' ||
              m.type === 'helpdesk'
          );
          setMessages(helpdeskList);
        }
      }
    } catch (err) {
      console.warn('Error loading helpdesk messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpdeskMessages();

    // Subscribe to Realtime messages for instant live admin updates
    const channel = supabase
      .channel('admin-helpdesk-inbox')
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        if (payload && (payload.room_id?.startsWith('room_admin_') || payload.recipient_mobile === 'ADMIN')) {
          setMessages((prev) => {
            const newMsg: HelpdeskMessage = {
              id: payload.id || `msg_${Date.now()}`,
              senderMobile: payload.sender_mobile,
              senderName: payload.sender_name,
              senderPhoto: payload.sender_photo,
              recipientMobile: 'ADMIN',
              recipientName: 'Gramodaya Admin',
              text: payload.text,
              villageId: payload.village_id,
              createdAt: payload.created_at || new Date().toISOString(),
              read: false,
            };
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          playChatChime();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Group messages by citizen mobile
  const citizenThreads = useMemo(() => {
    const threadMap: Record<string, { citizenMobile: string; citizenName: string; citizenPhoto?: string; villageId?: string; messages: HelpdeskMessage[]; lastMessage: HelpdeskMessage; unreadCount: number }> = {};

    messages.forEach((msg) => {
      const isFromAdmin = msg.senderMobile === 'ADMIN';
      const citizenMob = isFromAdmin ? msg.recipientMobile : msg.senderMobile;
      const citizenName = isFromAdmin ? msg.recipientName : msg.senderName;
      const citizenPhoto = isFromAdmin ? undefined : msg.senderPhoto;

      if (!threadMap[citizenMob]) {
        threadMap[citizenMob] = {
          citizenMobile: citizenMob,
          citizenName: citizenName || 'Citizen',
          citizenPhoto,
          villageId: msg.villageId,
          messages: [],
          lastMessage: msg,
          unreadCount: 0,
        };
      }

      threadMap[citizenMob].messages.push(msg);

      // Check if this msg is newer than lastMessage
      if (new Date(msg.createdAt) >= new Date(threadMap[citizenMob].lastMessage.createdAt)) {
        threadMap[citizenMob].lastMessage = msg;
      }

      // Count unread incoming messages
      if (!isFromAdmin && !msg.read) {
        threadMap[citizenMob].unreadCount += 1;
      }
    });

    return Object.values(threadMap).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [messages]);

  // Filter threads by search and village
  const filteredThreads = useMemo(() => {
    return citizenThreads.filter((t) => {
      if (selectedVillageFilter !== 'ALL' && String(t.villageId) !== String(selectedVillageFilter)) {
        return false;
      }
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return t.citizenName.toLowerCase().includes(term) || t.citizenMobile.includes(term);
    });
  }, [citizenThreads, selectedVillageFilter, searchTerm]);

  // Active selected thread messages
  const activeThread = useMemo(() => {
    if (!selectedCitizenMobile) return null;
    return citizenThreads.find((t) => t.citizenMobile === selectedCitizenMobile) || null;
  }, [citizenThreads, selectedCitizenMobile]);

  useEffect(() => {
    if (activeThread) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread]);

  // Send reply from Admin to Citizen
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    setSending(true);
    const textToSend = replyText.trim();
    setReplyText('');

    const newMsg: HelpdeskMessage = {
      id: `msg_admin_${Date.now()}`,
      senderMobile: 'ADMIN',
      senderName: authSession.adminName || 'ग्रामोदय एडमिन',
      recipientMobile: activeThread.citizenMobile,
      recipientName: activeThread.citizenName,
      text: textToSend,
      villageId: activeThread.villageId,
      createdAt: new Date().toISOString(),
      read: true,
    };

    // Optimistically add to UI
    setMessages((prev) => [...prev, newMsg]);

    // 1. Send via Supabase Realtime to citizen's room
    const citizenDigits = activeThread.citizenMobile.replace(/\D/g, '').slice(-10);
    const citizenRoomId = `room_admin_${activeThread.villageId || '1'}_${citizenDigits}`;

    const channel = supabase.channel(`room_${citizenRoomId}`);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: {
            id: newMsg.id,
            room_id: citizenRoomId,
            sender_mobile: 'ADMIN',
            sender_name: authSession.adminName || 'ग्रामोदय एडमिन',
            text: textToSend,
            village_id: activeThread.villageId,
            created_at: newMsg.createdAt,
          },
        });
      }
    });

    // 2. Persist to API
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderMobile: 'ADMIN',
          senderName: authSession.adminName || 'ग्रामोदय एडमिन',
          recipientMobile: activeThread.citizenMobile,
          recipientName: activeThread.citizenName,
          text: textToSend,
          villageId: activeThread.villageId,
          type: 'helpdesk',
        }),
      });
    } catch (err) {
      console.warn('Error saving admin reply:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B2E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {lang === 'en' ? 'Admin Helpdesk & Inquiries' : 'एडमिन हेल्पडेस्क एवं नागरिक संवाद'}
              </h2>
              <Badge variant="emerald" className="text-[10px] font-bold">
                {citizenThreads.length} {lang === 'en' ? 'Threads' : 'संवाद'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {lang === 'en'
                ? 'Respond directly to citizen inquiries and feedback in real-time.'
                : 'नागरिकों द्वारा एडमिन हेल्पडेस्क पर भेजे गए प्रश्नों का सीधे उत्तर दें।'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHelpdeskMessages}
            disabled={loading}
            className="rounded-xl text-xs gap-1.5 font-bold shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{lang === 'en' ? 'Refresh' : 'ताज़ा करें'}</span>
          </Button>
        </div>
      </div>

      {/* Main Inbox Container */}
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[550px] max-h-[720px] flex flex-col md:flex-row">
        {/* Left Side: Threads List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
            selectedCitizenMobile ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Filter & Search Header */}
          <div className="p-3.5 space-y-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <Input
                type="text"
                placeholder={lang === 'en' ? 'Search citizen name or mobile...' : 'नागरिक नाम या मोबाइल खोजें...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-8 text-xs font-medium rounded-xl"
              />
            </div>

            {/* Village Selector */}
            {villages && villages.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs pb-1">
                <Button
                  variant={selectedVillageFilter === 'ALL' ? 'emerald' : 'ghost'}
                  size="xs"
                  onClick={() => setSelectedVillageFilter('ALL')}
                  className="rounded-lg text-[10px] font-bold h-6"
                >
                  {lang === 'en' ? 'All Units' : 'सभी ग्राम'}
                </Button>
                {villages.map((v) => (
                  <Button
                    key={v.id}
                    variant={selectedVillageFilter === String(v.id) ? 'emerald' : 'ghost'}
                    size="xs"
                    onClick={() => setSelectedVillageFilter(String(v.id))}
                    className="rounded-lg text-[10px] font-bold h-6 whitespace-nowrap"
                  >
                    {v.nameHindi || v.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Threads Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 scrollbar-thin">
            {loading && citizenThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                {lang === 'en' ? 'Loading helpdesk messages...' : 'संदेश लोड हो रहे हैं...'}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold">
                  {lang === 'en' ? 'No inquiry messages found.' : 'कोई संवाद संदेश नहीं मिला।'}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedCitizenMobile === thread.citizenMobile;
                const timeStr = new Date(thread.lastMessage.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <button
                    key={thread.citizenMobile}
                    type="button"
                    onClick={() => setSelectedCitizenMobile(thread.citizenMobile)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      {thread.citizenPhoto ? (
                        <AvatarImage src={thread.citizenPhoto} alt={thread.citizenName} />
                      ) : null}
                      <AvatarFallback className="text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {thread.citizenName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {thread.citizenName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {timeStr}
                        </span>
                      </div>

                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                        {thread.citizenMobile}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
                        {thread.lastMessage.senderMobile === 'ADMIN' ? 'आप: ' : ''}
                        {thread.lastMessage.text}
                      </p>
                    </div>

                    {thread.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] font-black h-5 px-1.5 rounded-full">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Thread & Reply */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-[#0B0F17] ${
            !selectedCitizenMobile ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 sm:p-4 bg-white dark:bg-[#131B2E] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCitizenMobile(null)}
                    className="md:hidden h-8 w-8 rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>

                  <Avatar className="w-9 h-9 border border-slate-200 dark:border-slate-700">
                    {activeThread.citizenPhoto ? (
                      <AvatarImage src={activeThread.citizenPhoto} alt={activeThread.citizenName} />
                    ) : null}
                    <AvatarFallback className="text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {activeThread.citizenName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeThread.citizenName}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{activeThread.citizenMobile}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {lang === 'en' ? 'Helpdesk Inquiry' : 'नागरिक सहायता'}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${activeThread.citizenMobile}`}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-emerald-600 transition"
                  title="Call Citizen"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {activeThread.messages.map((msg) => {
                  const isFromAdmin = msg.senderMobile === 'ADMIN';
                  const time = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isFromAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                          isFromAdmin
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-[10px] font-black ${
                              isFromAdmin ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isFromAdmin ? (authSession.adminName || 'Admin') : msg.senderName}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-semibold ${
                            isFromAdmin ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          <span>{time}</span>
                          {isFromAdmin && <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input Bar */}
              <form
                onSubmit={handleSendReply}
                className="p-3 bg-white dark:bg-[#131B2E] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <Input
                  type="text"
                  placeholder={
                    lang === 'en'
                      ? `Reply to ${activeThread.citizenName}...`
                      : `${activeThread.citizenName} को उत्तर लिखें...`
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="h-10 text-xs sm:text-sm rounded-xl font-medium"
                />
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  disabled={sending || !replyText.trim()}
                  className="h-10 px-4 rounded-xl font-bold gap-1.5 flex-shrink-0 shadow-md"
                >
                  <span>{lang === 'en' ? 'Reply' : 'उत्तर भेजें'}</span>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'en' ? 'Select a citizen inquiry to respond' : 'उत्तर देने के लिए नागरिक संवाद का चयन करें'}
                </p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  {lang === 'en'
                    ? 'Incoming inquiries from the Admin Helpdesk will appear in real-time here.'
                    : 'नागरिकों द्वारा एडमिन हेल्पडेस्क पर पूछे गए प्रश्न सीधे यहाँ दिखाई देंगे।'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
