'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Send, Sparkles, X, Paperclip, Smile, Mic } from 'lucide-react';
import { uploadToMemberPhotosBucket } from '../../../lib/supabaseChat';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface ChatInputBarProps {
  messageText: string;
  senderName: string;
  sending: boolean;
  errorMsg: string;
  onMessageChange: (text: string) => void;
  onSendMessage: (e?: React.FormEvent, attachmentUrl?: string, audioUrl?: string) => void;
  onQuickSend: (phrase: string) => void;
  onTyping?: () => void;
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
  onTyping,
  lang,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  // Voice Recording Simulator State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const quickPhrases =
    lang === 'en'
      ? ['Jai Gramodaya! 🙏', 'Greetings! ☀️', 'Village Discussion 🌾', 'Next meeting? 📅', 'Great initiative! 👍']
      : ['जय ग्रामोदय! 🙏', 'नमस्कार जी! ☀️', 'ग्राम विकास चर्चा 🌾', 'बैठक का समय क्या है?', 'सराहनीय प्रयास 👍'];

  const emojis = ['🙏', '❤️', '👍', '🌾', '🌱', '☀️', '🎉', '👏', '🤝', '🇮🇳', '🔥', '✨', '🏆', '💯', '🌸', '💬'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'en' ? 'Please select an image file.' : 'कृपया केवल फोटो फाइल चुनें।');
      return;
    }

    try {
      setUploadingMedia(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setSelectedPhoto(base64);

        // Upload to Supabase Storage Bucket
        const uploadRes = await uploadToMemberPhotosBucket(base64, `chat_${Date.now()}`);
        if (uploadRes.success && uploadRes.publicUrl) {
          setSelectedPhoto(uploadRes.publicUrl);
        }
        setUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('Chat media upload fallback:', err);
      setUploadingMedia(false);
    }
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && !selectedPhoto) return;
    onSendMessage(e, selectedPhoto || undefined);
    setSelectedPhoto(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handleTextChange = (val: string) => {
    onMessageChange(val);
    if (onTyping) onTyping();
  };

  const appendEmoji = (emoji: string) => {
    onMessageChange(messageText + emoji);
    if (onTyping) onTyping();
  };

  const handleStopAndSendVoice = () => {
    setIsRecording(false);
    const audioNoteText =
      lang === 'en'
        ? `🎙️ Voice Note (${recordingSeconds}s)`
        : `🎙️ ऑडियो संदेश (${recordingSeconds} सेकंड)`;
    onSendMessage(undefined, undefined, 'simulated_audio');
    onQuickSend(audioNoteText);
  };

  return (
    <div className="bg-card border-t border-border transition-colors">
      {/* Quick Suggestion Chips Bar */}
      <div className="py-2 px-3.5 bg-muted/30 border-b border-border/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-black text-muted-foreground flex-shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">{lang === 'en' ? 'Quick' : 'त्वरित'}</span>
        </span>
        {quickPhrases.map((quick, idx) => (
          <Button
            key={idx}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onQuickSend(quick)}
            className="rounded-full text-[10px] font-bold h-6 flex-shrink-0 shadow-2xs hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-slate-800"
          >
            {quick}
          </Button>
        ))}
      </div>

      {/* Emoji Drawer Bar */}
      {showEmojiBar && (
        <div className="py-2 px-3.5 bg-muted/50 border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {emojis.map((em, i) => (
            <button
              key={i}
              type="button"
              onClick={() => appendEmoji(em)}
              className="text-lg hover:scale-135 transition cursor-pointer p-1 active:scale-90"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Image Attachment Preview Card */}
      {selectedPhoto && (
        <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedPhoto}
              alt="Attachment Preview"
              className="w-12 h-12 object-cover rounded-xl border border-emerald-500/40 shadow-xs"
            />
            <div>
              <p className="text-xs font-bold text-foreground">
                {lang === 'en' ? 'Photo Attached' : 'फोटो संलग्न'}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                {uploadingMedia
                  ? (lang === 'en' ? 'Uploading to cloud...' : 'अपलोड हो रहा है...')
                  : (lang === 'en' ? 'Ready to send' : 'भेजने के लिए तैयार')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedPhoto(null)}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Voice Recording Simulator Active Bar */}
      {isRecording ? (
        <div className="p-3.5 bg-destructive/10 border-t border-destructive/20 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-destructive animate-ping"></span>
            <span className="text-xs font-black text-destructive">
              {lang === 'en' ? 'Recording Voice Note' : 'ऑडियो रिकॉर्ड हो रहा है...'} ({recordingSeconds}s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRecording(false)}
              className="rounded-xl text-xs"
            >
              {lang === 'en' ? 'Cancel' : 'रद्द करें'}
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={handleStopAndSendVoice}
              className="rounded-xl text-xs font-black gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Send' : 'भेजें'}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Elevated Modern Input Bar using Shadcn Input and Buttons */
        <form
          onSubmit={handleFormSubmit}
          className="p-3 flex items-center gap-2 relative"
        >
          {errorMsg && (
            <div className="absolute top-[-40px] left-4 right-4 bg-destructive text-destructive-foreground text-xs font-bold p-2.5 rounded-xl text-center shadow-xl animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Media Attach Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl text-muted-foreground hover:text-emerald-600"
            title={lang === 'en' ? 'Attach Photo' : 'फोटो संलग्न करें'}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Emoji Toggle */}
          <Button
            type="button"
            variant={showEmojiBar ? 'emerald' : 'ghost'}
            size="icon"
            onClick={() => setShowEmojiBar(!showEmojiBar)}
            className="rounded-xl text-muted-foreground"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </Button>

          {/* Text Input using Shadcn Input */}
          <Input
            type="text"
            placeholder={lang === 'en' ? `Type a message (Press Enter to send)...` : `संदेश लिखें (भेजने के लिए Enter दबाएं)...`}
            value={messageText}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 text-xs sm:text-sm font-medium rounded-xl shadow-2xs"
          />

          {/* Voice Record Button */}
          {!messageText.trim() && !selectedPhoto ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setIsRecording(true)}
              className="rounded-xl shadow-2xs active:scale-95"
              title={lang === 'en' ? 'Record Voice Note' : 'ऑडियो रिकॉर्ड करें'}
            >
              <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </Button>
          ) : (
            /* Glowing Send Button */
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              disabled={sending || (!messageText.trim() && !selectedPhoto)}
              className="h-10 px-4 rounded-xl shadow-md gap-1.5 font-black flex-shrink-0"
              title={lang === 'en' ? 'Send message' : 'संदेश भेजें'}
            >
              <span className="hidden sm:inline">{lang === 'en' ? 'Send' : 'भेजें'}</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          )}
        </form>
      )}
    </div>
  );
};
