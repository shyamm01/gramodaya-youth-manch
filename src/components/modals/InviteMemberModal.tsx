'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  Send,
  Check,
  Copy,
  Share2,
  AlertCircle,
  UserPlus,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/context/ToastContext';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { lang, authSession } = useApp();
  const isEn = lang === 'en';
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{
    inviteLink: string;
    emailSent: boolean;
    name: string;
    email: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      const msg = isEn ? 'Please enter member full name' : 'कृपया सदस्य का पूरा नाम दर्ज करें';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Name Required' : 'नाम आवश्यक');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = isEn ? 'Please enter a valid email address' : 'कृपया एक मान्य ईमेल पता दर्ज करें';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Invalid Email' : 'अमान्य ईमेल');
      return;
    }

    setLoading(true);
    toastInfo(
      isEn ? 'Generating member invitation...' : 'सदस्य निमंत्रण तैयार किया जा रहा है...',
      isEn ? 'Inviting' : 'निमंत्रण'
    );

    try {
      const res = await fetch('/api/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          inviterName: authSession.email || (isEn ? 'Community Member' : 'ग्राम सदस्य'),
          lang: isEn ? 'en' : 'hi',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || (isEn ? 'Failed to send invitation.' : 'निमंत्रण भेजने में विफल।'));
      }

      setInviteResult({
        inviteLink: data.inviteLink,
        emailSent: data.emailSent,
        name: cleanName,
        email: cleanEmail,
      });

      toastSuccess(
        isEn
          ? `Invitation generated for ${cleanName}!`
          : `${cleanName} के लिए निमंत्रण लिंक तैयार हो गया!`,
        isEn ? 'Invitation Created' : 'निमंत्रण तैयार'
      );
    } catch (err: any) {
      const msg = err?.message || (isEn ? 'Failed to generate invitation.' : 'निमंत्रण बनाने में त्रुटि हुई।');
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Error' : 'त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteResult?.inviteLink) return;
    navigator.clipboard.writeText(inviteResult.inviteLink);
    setCopied(true);
    toastSuccess(
      isEn ? 'Invitation link copied to clipboard!' : 'निमंत्रण लिंक कॉपी कर लिया गया!',
      isEn ? 'Copied' : 'कॉपी पूर्ण'
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!inviteResult) return;
    const text = encodeURIComponent(
      `🌱 *ग्रामोदय यूथ मंच (Gramodaya Youth Manch)*\n\n` +
        `नमस्ते ${inviteResult.name},\n` +
        `आपको ग्रामोदय यूथ मंच से जुड़ने का विशेष निमंत्रण भेजा गया है।\n\n` +
        `कृपया नीचे दिए गए लिंक पर क्लिक करके अपना विवरण और पासवर्ड दर्ज करें:\n` +
        `${inviteResult.inviteLink}\n\n` +
        `_युवा शक्ति से ग्रामोदय की ओर_`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setInviteResult(null);
    setErrorMessage(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              {isEn ? 'Add / Invite Member' : 'नया सदस्य जोड़ें (आमंत्रित करें)'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isEn
                ? 'Send an invitation link to register a new community member'
                : 'ग्राम के नए सदस्य को पंजीकरण निमंत्रण लिंक भेजें'}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Success Result View */}
        {inviteResult ? (
          <div className="space-y-5 py-2 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                <Check className="w-4 h-4" />
                <span>{isEn ? 'Invitation Link Ready!' : 'निमंत्रण लिंक तैयार है!'}</span>
              </div>
              <p>
                {isEn
                  ? `An invitation link has been generated for ${inviteResult.name} (${inviteResult.email}). They can use this link to complete their basic details and set their password.`
                  : `${inviteResult.name} (${inviteResult.email}) के लिए निमंत्रण लिंक तैयार हो गया है। वे इस लिंक द्वारा अपना विवरण व पासवर्ड सेट कर सकते हैं।`}
              </p>
            </div>

            {/* Generated Link Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                {isEn ? 'Invitation Link' : 'निमंत्रण लिंक'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteResult.inviteLink}
                  className="flex-1 px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isEn ? 'Copied' : 'कॉपी हुआ'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Copy' : 'कॉपी'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{isEn ? 'Share on WhatsApp' : 'व्हाट्सएप पर भेजें'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInviteResult(null);
                  setName('');
                  setEmail('');
                }}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer"
              >
                {isEn ? 'Invite Another' : 'अन्य को आमंत्रित करें'}
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSendInvite} className="space-y-4">
            {/* Member Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                {isEn ? 'Member Full Name' : 'सदस्य का पूरा नाम'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isEn ? 'e.g. Shyam Kumar' : 'उदा. श्याम कुमार'}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Member Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                {isEn ? 'Email Address' : 'ईमेल पता'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm"
                />
              </div>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              {isEn
                ? 'An invitation link will be generated. The invited user will open the link to set up their password, phone number, and village basic details.'
                : 'एक निमंत्रण लिंक भेजा जाएगा। आमंत्रित सदस्य उस लिंक को खोलकर अपना पासवर्ड, मोबाइल नंबर व गांव का विवरण भरकर सदस्यता पूर्ण कर सकेंगे।'}
            </p>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer"
              >
                {isEn ? 'Cancel' : 'रद्द करें'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isEn ? 'Send Invitation Link' : 'निमंत्रण लिंक भेजें'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
