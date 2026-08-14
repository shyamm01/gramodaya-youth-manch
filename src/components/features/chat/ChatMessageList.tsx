'use client';

import React, { useRef, useEffect } from 'react';
import { MessageSquare, Trash2, CheckCheck } from 'lucide-react';
import { SupabaseMessage } from '../../../lib/supabaseChat';

interface ChatMessageListProps {
  messages: SupabaseMessage[];
  currentMobile: string;
  isAdminLoggedIn: boolean;
  activeTab: 'group' | 'admin' | 'personal';
  onDeleteMessage: (msgId: string) => void;
  lang: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentMobile,
  isAdminLoggedIn,
  activeTab,
  onDeleteMessage,
  lang,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const prevMessagesCountRef = useRef(messages.length);

  // Auto-scroll ONLY the chat container, preventing the browser window from scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isInitialLoadRef.current) {
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
      prevMessagesCountRef.current = messages.length;
      return;
    }

    if (messages.length > prevMessagesCountRef.current) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 180;

      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages]);

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return lang === 'en' ? 'Just now' : 'अभी';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return lang === 'en' ? 'Just now' : 'अभी';
    }
  };

  if (messages.length === 0) {
    return (
      <div
        ref={containerRef}
        className="flex-1 p-6 overflow-y-auto bg-[#FBF9F5] dark:bg-[#0B0F17] flex flex-col items-center justify-center text-center text-slate-500 space-y-2.5 select-none"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shadow-xs">
          <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400 opacity-80" />
        </div>
        <p className="text-sm font-bold text-[#2C3327] dark:text-white">
          {activeTab === 'group'
            ? (lang === 'en' ? 'Start the conversation in Village Forum!' : 'ग्रामोदय समूह मंच में पहला संदेश भेजें!')
            : (lang === 'en' ? 'No messages here yet.' : 'इस संवाद में अभी कोई संदेश नहीं है।')}
        </p>
        <p className="text-xs text-[#8C8675] dark:text-slate-400 max-w-xs font-medium">
          {lang === 'en'
            ? 'Express your thoughts courteously for village progress.'
            : 'सभ्य एवं सकारात्मक संवाद करें। ग्राम विकास हेतु विचार साझा करें।'}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#FBF9F5] dark:bg-[#0B0F17] scrollbar-thin transition-colors"
    >
      {messages.map((msg) => {
        const myDigits = (currentMobile || '').replace(/\D/g, '').slice(-10);
        const senderDigits = (msg.sender_mobile || '').replace(/\D/g, '').slice(-10);
        const isMe = myDigits && senderDigits === myDigits;

        return (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${
              isMe ? 'flex-row-reverse' : 'flex-row'
            } group animate-fade-in`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0 mb-0.5">
              {msg.sender_photo ? (
                <img
                  src={msg.sender_photo}
                  alt={msg.sender_name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-600/60 dark:border-emerald-500/60 shadow-xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1E3A2F] dark:bg-emerald-900 text-emerald-200 font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                  {msg.sender_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[70%] space-y-0.5 ${
                isMe ? 'items-end text-right' : 'items-start text-left'
              }`}
            >
              {/* Message Content Box */}
              <div
                className={`p-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-2xs ${
                  isMe
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-[#161F33] text-[#1E251B] dark:text-slate-100 border border-[#E0DCCF]/80 dark:border-slate-800 rounded-bl-xs'
                }`}
              >
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                      {msg.sender_name}
                    </span>
                    {msg.sender_member_id && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[8px] font-bold px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                        {msg.sender_member_id}
                      </span>
                    )}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                <div
                  className={`flex items-center gap-1 mt-1 text-[9px] font-semibold ${
                    isMe ? 'text-emerald-200 justify-end' : 'text-[#8C8675] dark:text-slate-400 justify-start'
                  }`}
                >
                  <span>{formatMessageTime(msg.created_at)}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-300 inline" />}
                </div>
              </div>

              {/* Delete Action on Hover */}
              {(isMe || isAdminLoggedIn) && (
                <div className={`px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-800 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title={lang === 'en' ? 'Delete message' : 'संदेश हटाएं'}
                  >
                    <Trash2 className="w-2.5 h-2.5 inline mr-0.5" />
                    <span>{lang === 'en' ? 'Delete' : 'हटाएं'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
