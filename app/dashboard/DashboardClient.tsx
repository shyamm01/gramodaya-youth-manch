'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/context/ToastContext';
import {
  User,
  Mail,
  Shield,
  Calendar,
  LogOut,
  KeyRound,
  Edit3,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  HeartHandshake,
  MessageSquareQuote,
  Building2,
  ExternalLink,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ProfileData {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserAuthData {
  id: string;
  email: string | null;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
}

interface DashboardClientProps {
  user: UserAuthData;
  initialProfile: ProfileData | null;
}

export function DashboardClient({ user, initialProfile }: DashboardClientProps) {
  const router = useRouter();
  const { lang, setAuthSession } = useApp();
  const isEn = lang === 'en';

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security & Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Realtime subscription for public.profiles changes
  useEffect(() => {
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const updated = payload.new as any;
            setProfile({
              id: updated.id,
              fullName: updated.full_name,
              avatarUrl: updated.avatar_url,
              createdAt: updated.created_at,
              updatedAt: updated.updated_at,
            });
            if (updated.full_name) setFullName(updated.full_name);
            if (updated.avatar_url) setAvatarUrl(updated.avatar_url);
            toastInfo(
              isEn ? 'Profile updated in realtime' : 'प्रोफ़ाइल डेटा वास्तविक समय में अद्यतन हुआ',
              isEn ? 'Sync' : 'सिंक'
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user.id, isEn, toastInfo]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const cleanName = fullName.trim();
      const cleanAvatar = avatarUrl.trim();

      // 1. Update public.profiles via Supabase client
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: cleanName,
          avatar_url: cleanAvatar,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Sync auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
          name: cleanName,
          avatar_url: cleanAvatar,
        },
      });

      if (data) {
        setProfile(data as ProfileData);
      }
      setIsEditing(false);
      const succMsg = isEn ? 'Profile updated successfully!' : 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!';
      setStatusMessage({
        type: 'success',
        text: succMsg,
      });
      toastSuccess(succMsg, isEn ? 'Profile' : 'प्रोफ़ाइल');
      router.refresh();
    } catch (err: any) {
      const errMsg = err?.message || (isEn ? 'Failed to update profile.' : 'प्रोफ़ाइल सहेजने में त्रुटि।');
      setStatusMessage({
        type: 'error',
        text: errMsg,
      });
      toastError(errMsg, isEn ? 'Error' : 'त्रुटि');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      const msg = isEn ? 'Password must be at least 8 characters' : 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए';
      setPasswordError(msg);
      toastError(msg, isEn ? 'Weak Password' : 'कमजोर पासवर्ड');
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = isEn ? 'Passwords do not match' : 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते';
      setPasswordError(msg);
      toastError(msg, isEn ? 'Password Mismatch' : 'पासवर्ड बेमेल');
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      const succ = isEn ? 'Password updated successfully!' : 'पासवर्ड सफलतापूर्वक अपडेट किया गया!';
      setPasswordSuccess(succ);
      toastSuccess(succ, isEn ? 'Success' : 'सफल');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.message || (isEn ? 'Failed to update password.' : 'पासवर्ड बदलने में त्रुटि।');
      setPasswordError(msg);
      toastError(msg, isEn ? 'Error' : 'त्रुटि');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    toastInfo(isEn ? 'Signing out...' : 'सत्र समाप्त किया जा रहा है...', isEn ? 'Logout' : 'लॉग आउट');
    try {
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gym_auth');
        localStorage.removeItem('gym_member_mobile');
      }
      setAuthSession({
        isMemberLoggedIn: false,
        isAdminLoggedIn: false,
        token: null,
        email: null,
        supabaseUserId: null,
      });
      toastSuccess(isEn ? 'You have logged out successfully.' : 'आप सफलतापूर्वक लॉग आउट हो चुके हैं।', isEn ? 'Goodbye' : 'अलविदा');
      router.refresh();
      router.replace('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.replace('/auth/login');
    }
  };

  const displayName = profile?.fullName || user.email?.split('@')[0] || (isEn ? 'Community Member' : 'ग्राम सदस्य');
  const displayAvatar =
    profile?.avatarUrl && profile.avatarUrl.trim().length > 0
      ? profile.avatarUrl
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=059669,d97706`;

  const formattedCreatedDate = new Date(user.createdAt).toLocaleDateString(isEn ? 'en-US' : 'hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-in fade-in">
      {/* Global Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <Check className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            {isEn ? 'Dismiss' : 'हटाएं'}
          </button>
        </div>
      )}

      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-10 shadow-2xl border border-stone-800">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-800 border-2 border-amber-400/40 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      displayName
                    )}`;
                  }}
                />
              </div>
              <span
                className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-stone-900 text-white"
                title={isEn ? 'Active Verified Session' : 'सत्यापित सक्रिय सत्र'}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* User Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user.provider === 'google' ? 'Google OAuth' : 'Email/Password'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isEn ? 'Active Session' : 'सत्यापित सत्र'}
                </span>
              </div>
              <p className="text-sm text-stone-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-400" />
                <span>{user.email || (isEn ? 'No email' : 'ईमेल अनुपलब्ध')}</span>
              </p>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {isEn ? 'Member since' : 'सदस्यता तिथि'}: {formattedCreatedDate}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-semibold backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>
                {isEditing
                  ? isEn
                    ? 'Cancel'
                    : 'रद्द करें'
                  : isEn
                  ? 'Edit Profile'
                  : 'प्रोफ़ाइल बदलें'}
              </span>
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 border border-rose-500/30 text-white text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loggingOut ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>{isEn ? 'Logout' : 'लॉग आउट'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Profile Editing Panel */}
      {isEditing && (
        <div className="bg-white dark:bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{isEn ? 'Live Profile Edit' : 'प्रोफ़ाइल विवरण अपडेट करें'}</span>
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                {isEn ? 'Full Name' : 'पूरा नाम'}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isEn ? 'e.g. Ramesh Kumar' : 'उदा. रमेश कुमार'}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                {isEn ? 'Avatar Image URL' : 'अवतार / फ़ोटो URL'}
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                {isEn
                  ? 'If left blank, an avatar will be generated automatically.'
                  : 'यदि खाली छोड़ते हैं, तो स्वतः अवतार उत्पन्न होगा।'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Save Changes' : 'सहेजें'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-3 px-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-sm hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer"
              >
                {isEn ? 'Cancel' : 'रद्द करें'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Sections: Account Security & Village Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Security Card */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>{isEn ? 'Account Security' : 'खाता सुरक्षा'}</span>
          </h2>

          <div className="space-y-3 text-sm">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
              <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {isEn ? 'User ID' : 'उपयोगकर्ता ID'}
              </div>
              <div className="font-mono text-xs text-stone-800 dark:text-stone-200 truncate mt-1 select-all">
                {user.id}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
              <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {isEn ? 'Auth Provider' : 'प्रमाणीकरण प्रदाता'}
              </div>
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1 capitalize">
                {user.provider}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
              <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {isEn ? 'Last Sign-In' : 'अंतिम साइन इन'}
              </div>
              <div className="text-xs font-medium text-stone-800 dark:text-stone-200 mt-1">
                {user.lastSignInAt
                  ? new Date(user.lastSignInAt).toLocaleString(isEn ? 'en-US' : 'hi-IN')
                  : isEn
                  ? 'Currently Active'
                  : 'वर्तमान में सक्रिय'}
              </div>
            </div>

            {/* Quick Password Update Box */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{isEn ? 'Change Password' : 'पासवर्ड अपडेट'}</span>
              </h3>

              {passwordSuccess && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-2.5">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isEn ? 'New password' : 'नया पासवर्ड'}
                    className="w-full px-3 py-2 pr-9 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {newPassword.length > 0 && newPassword.length < 8 && (
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 pl-1">
                    {isEn ? 'Minimum 8 characters' : 'कम से कम 8 अक्षर'}
                  </p>
                )}

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isEn ? 'Confirm new password' : 'नए पासवर्ड की पुष्टि करें'}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {updatingPassword ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Update Password' : 'पासवर्ड बदलें'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Portal Navigation & Village Services */}
        <div className="md:col-span-2 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{isEn ? 'Village Services & Navigation' : 'ग्रामोदय पोर्टल सेवाएं'}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/problems"
              className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 hover:border-amber-500/50 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <MessageSquareQuote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {isEn ? 'Grievances & Problems' : 'ग्राम समस्याएं'}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isEn ? 'Report and track issues' : 'शिकायत दर्ज व ट्रैक करें'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>

            <Link
              href="/social-work"
              className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 hover:border-emerald-500/50 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {isEn ? 'Social Initiatives' : 'सामाजिक कार्य'}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isEn ? 'Development missions' : 'विकास एवं सेवा अभियान'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>

            <Link
              href="/announcements"
              className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 hover:border-blue-500/50 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {isEn ? 'Announcements' : 'ग्राम सूचनाएं'}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isEn ? 'Official announcements' : 'आधिकारिक घोषणाएं'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>

            <Link
              href="/members"
              className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 hover:border-purple-500/50 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {isEn ? 'Member Directory' : 'सदस्य निर्देशिका'}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isEn ? 'Gram Panchayat members list' : 'ग्राम पंचायत सदस्य सूची'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
