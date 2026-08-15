'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, Trash2, CheckCheck, Smile, ChevronDown, X } from 'lucide-react';
import { SupabaseMessage } from '../../../lib/supabaseChat';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

interface ChatMessageListProps {
  messages: SupabaseMessage[];
  currentMobile: string;
  isAdminLoggedIn: boolean;
  activeTab: 'group' | 'admin' | 'personal';
  onDeleteMessage: (msgId: string) => void;
  onReactToMessage?: (msgId: string, emoji: string) => void;
  typingUser?: string | null;
  lang: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentMobile,
  isAdminLoggedIn,
  activeTab,
  onDeleteMessage,
  onReactToMessage,
  typingUser,
  lang,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const prevMessagesCountRef = useRef(messages.length);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [activeReactionMenuMsgId, setActiveReactionMenuMsgId] = useState<string | null>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const quickReactionEmojis = ['🙏', '❤️', '👍', '🌾', '🎉', '🔥', '👏', '🤝'];

  // Handle scroll detection for "Scroll to bottom" button
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const isFarFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight > 220;
    setShowScrollBottomBtn(isFarFromBottom);
  };

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
    setShowScrollBottomBtn(false);
  };

  // Close reaction menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveReactionMenuMsgId(null);
    };
    if (activeReactionMenuMsgId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [activeReactionMenuMsgId]);

  // Auto-scroll on new messages
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
        container.scrollHeight - container.scrollTop - container.clientHeight < 240;

      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, typingUser]);

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
        className="flex-1 p-8 overflow-y-auto bg-muted/20 flex flex-col items-center justify-center text-center text-muted-foreground space-y-3 select-none"
      >
        <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
          <MessageSquare className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-black text-foreground">
            {activeTab === 'group'
              ? (lang === 'en' ? 'Start the conversation in Village Forum!' : 'ग्रामोदय समूह मंच में पहला संदेश भेजें!')
              : (lang === 'en' ? 'No messages in this chat yet.' : 'इस संवाद में अभी कोई संदेश नहीं है।')}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm font-medium">
            {lang === 'en'
              ? 'Connect, collaborate, and share your ideas for village development.'
              : 'सभ्य, सकारात्मक एवं रचनात्मक संवाद करें। ग्राम विकास हेतु विचार साझा करें।'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 bg-muted/10 scrollbar-thin transition-colors relative"
    >
      {/* Lightbox Image Preview Modal */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPreviewImage}
              alt="Expanded Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 hover:bg-black/80 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {messages.map((msg) => {
        const myDigits = (currentMobile || '').replace(/\D/g, '').slice(-10);
        const senderDigits = (msg.sender_mobile || '').replace(/\D/g, '').slice(-10);
        const isMe = myDigits && senderDigits === myDigits;
        const attachedPhoto = (msg as any).photo_url || (msg as any).photoUrl;
        const reactions = msg.reactions || {};
        const reactionKeys = Object.keys(reactions);

        return (
          <div
            key={msg.id}
            className={`flex items-end gap-2.5 ${
              isMe ? 'flex-row-reverse' : 'flex-row'
            } group animate-fade-in relative`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0 mb-1">
              <Avatar className="w-8 h-8 border border-emerald-500/30 shadow-xs">
                {msg.sender_photo ? (
                  <AvatarImage src={msg.sender_photo} alt={msg.sender_name} className="object-cover" />
                ) : null}
                <AvatarFallback className="text-[11px] font-black bg-gradient-to-tr from-emerald-800 to-teal-950 text-emerald-200">
                  {msg.sender_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Bubble & Actions Column */}
            <div
              className={`max-w-[82%] sm:max-w-[70%] space-y-1 relative ${
                isMe ? 'items-end text-right' : 'items-start text-left'
              }`}
            >
              {/* Message Bubble Card */}
              <div
                className={`p-3.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-sm relative min-w-[140px] ${
                  isMe
                    ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-br-xs'
                    : 'bg-card text-card-foreground border border-border rounded-bl-xs'
                }`}
              >
                {/* Sender Name in Group Room */}
                {!isMe && (
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                      {msg.sender_name}
                    </span>
                    {msg.sender_member_id && (
                      <Badge variant="outline" className="text-[8px] px-1 py-0 font-mono font-bold shadow-none">
                        {msg.sender_member_id}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Photo Attachment */}
                {attachedPhoto && (
                  <div className="mb-2">
                    <img
                      src={attachedPhoto}
                      alt="Attachment"
                      onClick={() => setSelectedPreviewImage(attachedPhoto)}
                      className="max-h-52 sm:max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-95 transition border border-black/10 shadow-sm"
                    />
                  </div>
                )}

                {/* Message Text */}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Timestamp and Read Receipts */}
                <div
                  className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold select-none ${
                    isMe ? 'text-emerald-200 justify-end' : 'text-muted-foreground justify-start'
                  }`}
                >
                  <span>{formatMessageTime(msg.created_at)}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-300 inline" />}
                </div>
              </div>

              {/* Reaction Badges Row */}
              {reactionKeys.length > 0 && (
                <div className={`flex items-center gap-1.5 flex-wrap pt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {reactionKeys.map((emoji) => {
                    const count = reactions[emoji]?.length || 0;
                    if (count === 0) return null;
                    return (
                      <Badge
                        key={emoji}
                        variant="secondary"
                        onClick={() => onReactToMessage && onReactToMessage(msg.id, emoji)}
                        className="px-2 py-0.5 rounded-full text-[11px] gap-1 shadow-2xs hover:scale-105 transition cursor-pointer font-bold"
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] text-muted-foreground">{count}</span>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Actions Bar (Reaction & Delete) */}
              <div
                className={`relative flex items-center gap-1 pt-0.5 ${
                  isMe ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Floating Emoji Reactions Popover */}
                {activeReactionMenuMsgId === msg.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute bottom-full mb-1.5 z-50 flex items-center gap-1 p-1.5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-full shadow-2xl animate-fade-in ${
                      isMe ? 'right-0' : 'left-0'
                    }`}
                  >
                    {quickReactionEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onReactToMessage) onReactToMessage(msg.id, emoji);
                          setActiveReactionMenuMsgId(null);
                        }}
                        className="text-base p-1.5 hover:scale-130 active:scale-95 transition cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* React trigger */}
                {onReactToMessage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReactionMenuMsgId(
                        activeReactionMenuMsgId === msg.id ? null : msg.id
                      );
                    }}
                    className={`h-6 w-6 rounded-lg transition ${
                      activeReactionMenuMsgId === msg.id
                        ? 'text-amber-500 bg-muted'
                        : 'text-muted-foreground hover:text-amber-500'
                    }`}
                    title="React"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </Button>
                )}

                {/* Delete trigger */}
                {(isMe || isAdminLoggedIn) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteMessage(msg.id)}
                    className="h-6 w-6 rounded-lg text-muted-foreground hover:text-destructive"
                    title={lang === 'en' ? 'Delete message' : 'संदेश हटाएं'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Floating Scroll To Bottom Button */}
      {showScrollBottomBtn && (
        <Button
          variant="emerald"
          onClick={scrollToBottom}
          className="sticky bottom-3 left-1/2 -translate-x-1/2 rounded-full text-xs font-black shadow-xl gap-1.5 animate-bounce z-20"
        >
          <ChevronDown className="w-4 h-4" />
          <span>{lang === 'en' ? 'New messages below' : 'नए संदेश नीचे हैं'}</span>
        </Button>
      )}

      {/* Realtime Typing Indicator */}
      {typingUser && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-pulse pt-1 pl-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <span>{typingUser} {lang === 'en' ? 'is typing...' : 'टाइप कर रहे हैं...'}</span>
        </div>
      )}
    </div>
  );
};
