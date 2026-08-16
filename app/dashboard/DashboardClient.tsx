'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  UploadCloud,
  ImageIcon,
  Loader2,
  Trash2,
  Clock,
  ShieldAlert,
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
  membershipStatus?: 'active' | 'pending' | 'suspended';
  memberRole?: string;
  memberVillage?: string;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || '');
  const [membershipStatus, setMembershipStatus] = useState<'active' | 'pending' | 'suspended'>(
    user.membershipStatus || 'pending'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    const profileChannel = supabase
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

    // Realtime subscription for public.members approval changes
    const memberChannel = supabase
      .channel(`member-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'members',
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const updated = payload.new as any;
            if (updated.supabase_user_id === user.id || (user.email && updated.email === user.email)) {
              const newStatus = updated.status;
              setMembershipStatus(newStatus);
              if (newStatus === 'active') {
                toastSuccess(
                  isEn ? 'Your membership has been approved by the Admin!' : 'आपकी सदस्यता एडमिन द्वारा स्वीकृत कर दी गई है!',
                  isEn ? 'Membership Approved' : 'सदस्यता स्वीकृत'
                );
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(memberChannel);
    };
  }, [supabase, user.id, user.email, isEn, toastInfo, toastSuccess]);

  // Upload image handler via API route
  const handleFileUpload = async (file: File, isQuickAvatarUpdate: boolean = false) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const err = isEn ? 'Please select a valid image file (PNG, JPG, WebP).' : 'कृपया एक मान्य छवि फ़ाइल (PNG, JPG, WebP) चुनें।';
      toastError(err, isEn ? 'Invalid File' : 'अमान्य फ़ाइल');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const err = isEn ? 'Image size must be less than 5MB.' : 'छवि का आकार 5MB से कम होना चाहिए।';
      toastError(err, isEn ? 'File Too Large' : 'फ़ाइल बहुत बड़ी है');
      return;
    }

    setUploadingImage(true);
    toastInfo(isEn ? 'Uploading image...' : 'तस्वीर अपलोड हो रही है...', isEn ? 'Upload' : 'अपलोड');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'images');
      formData.append('folder', 'avatars');
      formData.append('filename', `user_${user.id}_${Date.now()}.${file.name.split('.').pop() || 'jpg'}`);

      const res = await fetch('/api/upload/supabase', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || (isEn ? 'Failed to upload image.' : 'तस्वीर अपलोड करने में विफल।'));
      }

      const uploadedUrl = data.url;
      setAvatarUrl(uploadedUrl);

      // If user clicked quick avatar change directly on the banner
      if (isQuickAvatarUpdate) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            avatar_url: uploadedUrl,
            updated_at: new Date().toISOString(),
          });

        if (profileErr) throw profileErr;

        await supabase.auth.updateUser({
          data: { avatar_url: uploadedUrl },
        });

        setProfile((prev) => (prev ? { ...prev, avatarUrl: uploadedUrl } : null));
        toastSuccess(isEn ? 'Profile photo updated!' : 'प्रोफ़ाइल फ़ोटो अपडेट हो गई!', isEn ? 'Success' : 'सफल');
        router.refresh();
      } else {
        toastSuccess(isEn ? 'Image uploaded successfully.' : 'तस्वीर सफलतापूर्वक अपलोड हो गई।', isEn ? 'Uploaded' : 'अपलोड पूर्ण');
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      const errMsg = err?.message || (isEn ? 'Image upload failed.' : 'तस्वीर अपलोड विफल रही।');
      toastError(errMsg, isEn ? 'Error' : 'त्रुटि');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

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
      {/* Hidden file input for quick avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, true);
        }}
      />

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

      {/* Pending Admin Approval Banner */}
      {membershipStatus === 'pending' && (
        <div className="p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <span>{isEn ? 'Membership Pending Admin Approval' : 'सदस्यता सत्यापन लंबित (Admin Approval Pending)'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {isEn ? 'Pending' : 'लंबित'}
                </span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {isEn
                  ? 'Your account was created successfully! An Admin or Super Admin will review your registration and grant final membership approval shortly.'
                  : 'आपका पंजीकरण सफलतापूर्वक प्राप्त हो गया है। ग्रामोदय यूथ मंच के एडमिन या सुपर-एडमिन द्वारा समीक्षा के बाद आपकी सदस्यता को अंतिम रूप से स्वीकृत किया जाएगा।'}
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300 shrink-0">
            {isEn ? 'Under Review' : 'समीक्षाधीन'}
          </div>
        </div>
      )}

      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-10 shadow-2xl border border-stone-800">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Quick Upload Trigger */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-800 border-2 border-amber-400/40 shadow-xl relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      displayName
                    )}`;
                  }}
                />

                {/* Upload Overlay on Hover / Click */}
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  title={isEn ? 'Click to change photo' : 'फ़ोटो बदलने के लिए क्लिक करें'}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all cursor-pointer backdrop-blur-[2px]"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-amber-400 mb-0.5" />
                      <span className="text-[10px] font-bold tracking-tight">
                        {isEn ? 'Change' : 'बदलें'}
                      </span>
                    </>
                  )}
                </button>
              </div>
              <span
                className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-stone-900 text-white shadow ${
                  membershipStatus === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={
                  membershipStatus === 'active'
                    ? isEn
                      ? 'Active Verified Member'
                      : 'सत्यापित सक्रिय सदस्य'
                    : isEn
                    ? 'Pending Admin Approval'
                    : 'सत्यापन लंबित'
                }
              >
                {membershipStatus === 'active' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
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
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    membershipStatus === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {membershipStatus === 'active'
                    ? isEn
                      ? 'Active Member'
                      : 'सत्यापित सदस्य'
                    : isEn
                    ? 'Pending Approval'
                    : 'सत्यापन लंबित'}
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

      {/* Real-time Profile Editing Panel with Integrated Image Uploader */}
      {isEditing && (
        <div className="bg-white dark:bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{isEn ? 'Live Profile Edit' : 'प्रोफ़ाइल विवरण अपडेट करें'}</span>
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
            {/* Full Name */}
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

            {/* Profile Image Uploader Zone */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                {isEn ? 'Profile Photo' : 'प्रोफ़ाइल फ़ोटो'}
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={editFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, false);
                }}
              />

              <div className="space-y-3">
                {/* Upload & Drop Card */}
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500/70 dark:hover:border-amber-500/70 rounded-2xl p-5 text-center cursor-pointer transition-all bg-stone-50/50 dark:bg-stone-800/30 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 group"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      {uploadingImage
                        ? isEn
                          ? 'Uploading image...'
                          : 'छवि अपलोड हो रही है...'
                        : isEn
                        ? 'Click to upload profile photo'
                        : 'फ़ोटो अपलोड करने के लिए क्लिक करें'}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isEn
                        ? 'Supports PNG, JPG, WebP up to 5MB'
                        : 'PNG, JPG, WebP फ़ाइल (अधिकतम 5MB)'}
                    </p>
                  </div>
                </div>

                {/* Preview Thumbnail if image is set */}
                {avatarUrl && avatarUrl.trim().length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{isEn ? 'Selected Image' : 'चयनित तस्वीर'}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-xs">
                          {avatarUrl}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title={isEn ? 'Remove image' : 'छवि हटाएं'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Optional Manual URL Input */}
                <div className="pt-1">
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder={isEn ? 'Or paste an image URL (https://...)' : 'या तस्वीर का URL पेस्ट करें (https://...)'}
                      className="w-full pl-11 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || uploadingImage}
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
                {isEn ? 'Membership Status' : 'सदस्यता स्थिति'}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                    membershipStatus === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {membershipStatus === 'active' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Approved & Active' : 'स्वीकृत व सक्रिय'}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>{isEn ? 'Pending Admin Approval' : 'एडमिन स्वीकृति हेतु लंबित'}</span>
                    </>
                  )}
                </span>
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
