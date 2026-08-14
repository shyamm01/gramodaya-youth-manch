'use client';

import React from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputBarProps {
  messageText: string;
  senderName: string;
  sending: boolean;
  errorMsg: string;
  onMessageChange: (text: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  onQuickSend: (phrase: string) => void;
  lang: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  messageText,
  senderName,
  sending,
  errorMsg,
  onMessageChange,
  onSendMessage,
  onQuickSend,
  lang,
}) => {
  const quickPhrases =
    lang === 'en'
      ? ['Jai Gramodaya! 🙏', 'Greetings! ☀️', 'Village Discussion 🌾', 'Next meeting? 📅', 'Great initiative! 👍']
      : ['जय ग्रामोदय! 🙏', 'नमस्कार जी! ☀️', 'ग्राम विकास चर्चा 🌾', 'बैठक का समय क्या है?', 'सराहनीय प्रयास 👍'];

  return (
    <div className="bg-white dark:bg-[#131B2E] border-t border-[#E0DCCF]/80 dark:border-slate-800 transition-colors">
      {/* Quick Reply Suggestion Chips */}
      <div className="py-1.5 px-3 bg-[#F0EDE4]/40 dark:bg-[#0B0F17]/40 border-b border-[#E0DCCF]/50 dark:border-slate-800/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-black text-[#8C8675] dark:text-slate-400 flex-shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        </span>
        {quickPhrases.map((quick, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onQuickSend(quick)}
            className="px-2.5 py-0.5 bg-white dark:bg-[#131B2E] hover:bg-emerald-50 dark:hover:bg-slate-800 text-[#2C3327] dark:text-slate-200 text-[10px] font-bold rounded-full border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition cursor-pointer flex-shrink-0 shadow-2xs active:scale-95"
          >
            {quick}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={onSendMessage}
        className="p-2.5 sm:p-3 flex items-center gap-2 relative"
      >
        {errorMsg && (
          <div className="absolute top-[-38px] left-4 right-4 bg-red-600 text-white text-xs font-bold p-2 rounded-xl text-center shadow-lg animate-fade-in">
            {errorMsg}
          </div>
        )}

        <input
          type="text"
          required
          placeholder={lang === 'en' ? `Type a message...` : `संदेश लिखें...`}
          value={messageText}
          onChange={(e) => onMessageChange(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-slate-100 border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-2xs placeholder:text-[#8C8675] dark:placeholder:text-slate-500"
        />

        <button
          type="submit"
          disabled={sending || !messageText.trim()}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-40 text-white text-xs sm:text-sm font-black rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 active:scale-95"
          title={lang === 'en' ? 'Send message' : 'संदेश भेजें'}
        >
          <span className="hidden sm:inline">{lang === 'en' ? 'Send' : 'भेजें'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
