'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, ChatMessage } from '../../types';
import {
  X,
  Send,
  Search,
  MessageSquare,
  UserCheck,
  ShieldCheck,
  Lock,
  Phone,
  RefreshCw,
  LogOut,
  User,
  CheckCheck,
  Trash2,
} from 'lucide-react';

interface MemberChatModalProps {
  initialPartner?: Member | null;
  onClose: () => void;
}

export const MemberChatModal: React.FC<MemberChatModalProps> = ({ initialPartner, onClose }) => {
  const {
    members,
    villageSettings,
    currentMemberMobile,
    setCurrentMemberMobile,
    fetchUserMessages,
    sendMessage,
    markMessagesRead,
  } = useApp();

  const activeMembers = members.filter((m) => m.status === 'active');

  // Member verification / selection state
  const [selectedMyMobile, setSelectedMyMobile] = useState<string>(currentMemberMobile || '');
  const [mobileInput, setMobileInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Identify current member object from activeMembers
  const currentMemberObj = activeMembers.find(
    (m) =>
      m.mobile &&
      m.mobile.replace(/\D/g, '').slice(-10) === selectedMyMobile.replace(/\D/g, '').slice(-10)
  );

  // Chat partner state
  const [activePartner, setActivePartner] = useState<Member | null>(
    initialPartner || activeMembers.find((m) => m.mobile !== currentMemberObj?.mobile) || null
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Poll / Fetch user messages
  const loadMessages = async () => {
    if (!selectedMyMobile) return;
    const msgs = await fetchUserMessages(selectedMyMobile);
    setMessages(msgs);
  };

  useEffect(() => {
    if (selectedMyMobile) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // 3 sec polling
      return () => clearInterval(interval);
    }
  }, [selectedMyMobile]);

  useEffect(() => {
    if (selectedMyMobile && activePartner && activePartner.mobile) {
      markMessagesRead(selectedMyMobile, activePartner.mobile);
    }
    scrollToBottom();
  }, [messages, activePartner, selectedMyMobile]);

  // Handle Login as Member
  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!mobileInput.trim()) {
      setLoginError('कृपया अपना पंजीकृत मोबाइल नंबर दर्ज करें।');
      return;
    }

    const digits = mobileInput.replace(/\D/g, '').slice(-10);
    const found = activeMembers.find(
      (m) => m.mobile && m.mobile.replace(/\D/g, '').slice(-10) === digits
    );

    if (!found) {
      setLoginError('यह मोबाइल नंबर ग्राम सदस्य सूची में नहीं मिला। केवल पंजीकृत सदस्य संदेश भेज सकते हैं।');
      return;
    }

    setCurrentMemberMobile(found.mobile);
    setSelectedMyMobile(found.mobile);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activePartner || !activePartner.mobile || !currentMemberObj) return;

    setSending(true);
    const textToSend = messageText.trim();
    setMessageText('');

    const res = await sendMessage(
      currentMemberObj.mobile,
      currentMemberObj.name,
      activePartner.mobile,
      activePartner.name,
      textToSend
    );

    setSending(false);
    if (res.success) {
      await loadMessages();
      scrollToBottom();
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!currentMemberObj) return;
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await fetch(
        `/api/messages?id=${encodeURIComponent(msgId)}&userMobile=${encodeURIComponent(
          currentMemberObj.mobile
        )}`,
        { method: 'DELETE', credentials: 'include' }
      );
    } catch (e) {
      console.warn('Delete error:', e);
    }
  };

  // Filter messages for active partner conversation
  const currentConversation = messages.filter((m) => {
    if (!activePartner || !activePartner.mobile || !currentMemberObj) return false;
    const myDigits = currentMemberObj.mobile.replace(/\D/g, '').slice(-10);
    const pDigits = activePartner.mobile.replace(/\D/g, '').slice(-10);

    const senderDigits = m.senderMobile.replace(/\D/g, '').slice(-10);
    const recipientDigits = m.recipientMobile.replace(/\D/g, '').slice(-10);

    return (
      (senderDigits === myDigits && recipientDigits === pDigits) ||
      (senderDigits === pDigits && recipientDigits === myDigits)
    );
  });

  const filteredMembers = activeMembers.filter((m) => {
    if (currentMemberObj && m.id === currentMemberObj.id) return false;
    return m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.mobile.includes(searchTerm);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[700px] shadow-2xl flex flex-col overflow-hidden border border-[#E0DCCF] animate-scale-up relative">
        {/* Top Header */}
        <div className="bg-[#2C3327] text-white px-4 py-3 flex items-center justify-between border-b border-[#3B4F3D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#4B634D] flex items-center justify-center text-amber-300 font-bold border border-amber-400/40">
              <MessageSquare className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>ग्राम सदस्य निजी संदेश (Member Chat)</span>
                <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>सुरक्षित (RLS Protected)</span>
                </span>
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                {villageSettings.orgNameHindi} — सदस्य संवाद
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEP 1: MEMBER LOGIN / IDENTITY SELECTION IF NOT LOGGED IN */}
        {!currentMemberObj ? (
          <div className="p-6 sm:p-10 flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#4B634D]/10 text-[#4B634D] flex items-center justify-center mb-4 border border-[#4B634D]/20">
              <ShieldCheck className="w-8 h-8 text-[#4B634D]" />
            </div>

            <h3 className="text-xl font-extrabold text-[#2C3327] mb-1">
              सदस्य पहचान की पुष्टि करें
            </h3>
            <p className="text-xs text-[#8C8675] mb-6 leading-relaxed">
              निजी संदेश भेजने के लिए अपना पंजीकृत मोबाइल नंबर दर्ज करें।
              केवल ग्राम पंचायत बहेरा (रसूलपुर) के स्वीकृत सदस्य ही चैट कर सकते हैं।
            </p>

            <form onSubmit={handleMemberLogin} className="w-full space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-[#2C3327] mb-1">
                  आपका पंजीकृत मोबाइल नंबर (Registered Mobile) *
                </label>
                <input
                  type="text"
                  required
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                  placeholder="उदा. 9876543210"
                  className="w-full px-4 py-3 bg-[#F7F5F0] border border-[#E0DCCF] rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#4B634D] focus:outline-none"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-left">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#4B634D] hover:bg-[#3B4F3D] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                चैट शुरू करें (Start Chat)
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#E0DCCF] w-full text-left">
              <p className="text-[11px] font-bold text-[#8C8675] mb-2">या स्वीकृत सदस्य चुनें:</p>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {activeMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (m.mobile) {
                        setCurrentMemberMobile(m.mobile);
                        setSelectedMyMobile(m.mobile);
                      }
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-[#F7F5F0] hover:bg-[#E0DCCF]/50 text-left text-xs transition"
                  >
                    <span className="font-bold text-[#2C3327]">{m.name}</span>
                    <span className="text-[10px] font-mono text-[#8C8675]">{m.mobile}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: CHAT INTERFACE WITH MEMBER LIST & ACTIVE CHAT */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar: Active Members List */}
            <div className="w-full md:w-80 border-r border-[#E0DCCF] bg-[#F7F5F0] flex flex-col h-1/3 md:h-full">
              {/* Current Member Status Header */}
              <div className="p-3 bg-white border-b border-[#E0DCCF] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#4B634D] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {currentMemberObj.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2C3327] truncate">{currentMemberObj.name}</p>
                    <p className="text-[10px] font-mono text-[#8C8675]">{currentMemberObj.mobile}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentMemberMobile(null);
                    setSelectedMyMobile('');
                  }}
                  className="p-1 text-slate-400 hover:text-red-600 transition"
                  title="प्रोफाइल बदलें"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-2.5 bg-white border-b border-[#E0DCCF]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8C8675] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="सदस्य खोजें..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E0DCCF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4B634D]"
                  />
                </div>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#E0DCCF]/60">
                {filteredMembers.length === 0 ? (
                  <p className="p-4 text-center text-xs text-[#8C8675]">कोई सदस्य नहीं मिला</p>
                ) : (
                  filteredMembers.map((m) => {
                    const isSelected = activePartner?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActivePartner(m);
                          if (selectedMyMobile && m.mobile) {
                            markMessagesRead(selectedMyMobile, m.mobile);
                          }
                        }}
                        className={`w-full p-3 text-left flex items-center justify-between transition cursor-pointer ${
                          isSelected ? 'bg-white border-l-4 border-[#4B634D] shadow-2xs' : 'hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#E0DCCF] border border-[#8C8675]/30 flex items-center justify-center text-[#2C3327] font-bold overflow-hidden flex-shrink-0">
                            {m.photoUrl ? (
                              <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserCheck className="w-5 h-5 text-[#4B634D]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2C3327] truncate">{m.name}</p>
                            <p className="text-[10px] font-mono text-[#8C8675]">{m.mobile}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-2/3 md:h-full bg-[#F7F5F0]">
              {activePartner ? (
                <>
                  {/* Active Partner Header */}
                  <div className="p-3 bg-white border-b border-[#E0DCCF] flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E0DCCF] border border-[#4B634D] overflow-hidden flex items-center justify-center">
                        {activePartner.photoUrl ? (
                          <img src={activePartner.photoUrl} alt={activePartner.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCheck className="w-6 h-6 text-[#4B634D]" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#2C3327]">{activePartner.name}</h4>
                        <p className="text-[11px] text-[#8C8675] font-mono">
                          {activePartner.mobile} • ग्राम सदस्य
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activePartner.mobile && activePartner.mobile !== 'Information not available' && (
                        <a
                          href={`tel:+91${activePartner.mobile.replace(/\D/g, '').slice(-10)}`}
                          className="p-2 bg-[#F7F5F0] hover:bg-[#E0DCCF] text-[#4B634D] rounded-full transition"
                          title="कॉल करें"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={loadMessages}
                        className="p-2 bg-[#F7F5F0] hover:bg-[#E0DCCF] text-[#8C8675] rounded-full transition"
                        title="ताज़ा करें"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentConversation.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8C8675]">
                        <MessageSquare className="w-10 h-10 text-[#8C8675]/40 mb-2" />
                        <p className="text-xs font-bold text-[#2C3327]">
                          {activePartner.name} के साथ नया चैट शुरू करें
                        </p>
                        <p className="text-[11px] text-[#8C8675] mt-1">
                          यह चैट केवल आपके और {activePartner.name} के बीच सुरक्षित है।
                        </p>
                      </div>
                    ) : (
                      currentConversation.map((msg) => {
                        const isMe =
                          msg.senderMobile.replace(/\D/g, '').slice(-10) ===
                          currentMemberObj.mobile.replace(/\D/g, '').slice(-10);
                        const time = new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 group">
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs font-medium leading-relaxed ${
                                  isMe
                                    ? 'bg-[#4B634D] text-white rounded-tr-none'
                                    : 'bg-white text-[#2C3327] border border-[#E0DCCF] rounded-tl-none'
                                }`}
                              >
                                <p>{msg.text}</p>
                                <div
                                  className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                    isMe ? 'text-emerald-100' : 'text-[#8C8675]'
                                  }`}
                                >
                                  <span>{time}</span>
                                  {isMe && (
                                    <CheckCheck
                                      className={`w-3 h-3 ${msg.read ? 'text-amber-300' : 'text-emerald-200'}`}
                                    />
                                  )}
                                </div>
                              </div>
                              {isMe && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                  title="संदेश हटाएं"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Greetings & Input */}
                  <div className="p-3 bg-white border-t border-[#E0DCCF]">
                    <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 text-[10px]">
                      {['जय हिंद! 🇮🇳', 'नमस्कार जी 🙏', 'ग्राम विकास चर्चा 🌾', 'सराहनीय कार्य 👍'].map(
                        (phrase) => (
                          <button
                            key={phrase}
                            onClick={() => setMessageText((prev) => (prev ? `${prev} ${phrase}` : phrase))}
                            className="py-1 px-2.5 bg-[#F7F5F0] hover:bg-[#E0DCCF] text-[#2C3327] rounded-full font-medium whitespace-nowrap transition border border-[#E0DCCF]"
                          >
                            {phrase}
                          </button>
                        )
                      )}
                    </div>

                    <form onSubmit={handleSend} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={`${activePartner.name} को संदेश लिखें...`}
                        className="flex-1 px-4 py-2.5 bg-[#F7F5F0] border border-[#E0DCCF] rounded-xl text-xs focus:ring-2 focus:ring-[#4B634D] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sending || !messageText.trim()}
                        className="p-2.5 bg-[#4B634D] hover:bg-[#3B4F3D] disabled:opacity-50 text-white rounded-xl transition cursor-pointer shadow-2xs flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-6 text-center text-[#8C8675]">
                  सदस्य चुनें
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
