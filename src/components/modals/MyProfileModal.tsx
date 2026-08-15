'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle2,
  CreditCard,
  Lock,
  Phone,
  MapPin,
  Calendar,
  User,
  Mail,
  Briefcase,
  Award,
  Droplet,
  Sparkles,
} from 'lucide-react';
import { DigitalIdCard } from '../features/DigitalIdCard';
import { DatePicker, Button, Input, ImageCropperModal } from '../ui';

export const MyProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    currentMemberMobile,
    members,
    authSession,
    uploadPhoto,
    refreshData,
    setSelectedIdCardMember,
    lang,
  } = useApp();

  const effectiveMobile = currentMemberMobile || authSession.adminMobile || authSession.currentMember?.mobile;
  const currentMember =
    authSession.currentMember ||
    members.find((m) => {
      if (!effectiveMobile) return false;
      const cleanM = (m.mobile || '').replace(/\D/g, '').slice(-10);
      const cleanCurr = effectiveMobile.replace(/\D/g, '').slice(-10);
      return cleanM && cleanCurr && cleanCurr.length >= 10 && cleanM === cleanCurr;
    }) ||
    (authSession.isAdminLoggedIn
      ? ({
          id: authSession.adminId || '1',
          name: authSession.adminName || 'Admin',
          mobile: authSession.adminMobile || '',
          email: authSession.email || '',
          role: (authSession.role as any) || 'ADMIN',
          systemRole: (authSession.systemRole as any) || 'SUPER_ADMIN',
          status: 'active',
          villageId: 'vil_rasoolpur',
          organizationName: 'ग्रामोदय यूथ मंच',
        } as any)
      : null);

  const isSuperAdmin = authSession.systemRole === 'SUPER_ADMIN' || currentMember?.systemRole === 'SUPER_ADMIN';
  const isAdmin = authSession.isAdminLoggedIn || currentMember?.role === 'ADMIN' || isSuperAdmin;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [designation, setDesignation] = useState('');
  const [politicalBackground, setPoliticalBackground] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Photo Cropping State (Declared unconditionally at top of component)
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingCropSrc, setPendingCropSrc] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (currentMember) {
      setName(currentMember.name || '');
      setFatherName(currentMember.fatherName || '');
      setDob(currentMember.dob || '');
      setGender(currentMember.gender || '');
      setEmail(currentMember.email || '');
      setAddress(currentMember.address || 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा');
      setOccupation(currentMember.occupation || '');
      setDesignation(currentMember.designation || '');
      setPoliticalBackground(currentMember.politicalBackground || '');
      setBloodGroup(currentMember.bloodGroup || '');
      setPhotoUrl(currentMember.photoUrl || '');
    }
  }, [currentMember, isOpen]);

  if (!isOpen || !currentMember) return null;

  // Format mobile cleanly without duplicating +91
  const formatMobileNumber = (mob?: string) => {
    if (!mob) return '';
    const digits = mob.replace(/\D/g, '').slice(-10);
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return mob;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg('');

    try {
      const res = await fetch(`/api/members/${currentMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          fatherName: fatherName.trim(),
          dob,
          gender,
          email: email.trim(),
          address: address.trim(),
          occupation: occupation.trim(),
          designation: designation.trim(),
          politicalBackground: politicalBackground.trim(),
          bloodGroup: bloodGroup.trim(),
          photoUrl,
        }),
      });

      if (res.ok) {
        setSaveMsg(lang === 'en' ? 'Profile updated successfully!' : 'प्रोफाइल सफलतापूर्वक अद्यतन (Update) हो गई!');
        await refreshData();
        setIsEditing(false);
        setTimeout(() => setSaveMsg(''), 3500);
      } else {
        setSaveMsg(lang === 'en' ? 'Failed to update profile.' : 'अद्यतन करने में त्रुटि हुई।');
      }
    } catch (e) {
      setSaveMsg(lang === 'en' ? 'Network error occurred.' : 'नेटवर्क त्रुटि हुई।');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPendingCropSrc(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      setIsUploadingPhoto(true);
      const { optimizeImage, STRICT_UNDER_100KB_LIMIT } = await import('@/src/lib/imageOptimizer');
      const optResult = await optimizeImage(croppedDataUrl, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.75,
        outputFormat: 'image/webp',
        maxSizeBytes: STRICT_UNDER_100KB_LIMIT,
      });

      const res = await fetch('/api/upload/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: optResult.dataUrl,
          bucket: 'gramodaya-youth-munch',
          folder: 'profiles',
          filename: `member_${currentMember.id}_${Date.now()}.webp`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          setPhotoUrl(data.url);
          await uploadPhoto('member', currentMember.id, data.url);
          setSaveMsg(lang === 'en' ? 'Profile photo updated successfully!' : 'प्रोफाइल फोटो सफलतापूर्वक अपडेट हो गई!');
          setTimeout(() => setSaveMsg(''), 3500);
          return;
        }
      }

      // Fallback
      setPhotoUrl(optResult.dataUrl);
      await uploadPhoto('member', currentMember.id, optResult.dataUrl);
    } catch (err) {
      console.warn('Profile photo upload error:', err);
    } finally {
      setIsUploadingPhoto(false);
      setPendingCropSrc(null);
      setIsCropperOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto transition-colors text-slate-900 dark:text-slate-50">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                {lang === 'en' ? 'My Profile' : 'मेरी प्रोफाइल (My Profile)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                {lang === 'en' ? 'Manage your personal account details' : 'केवल आप ही अपनी निजी जानकारी देख व सम्पादित कर सकते हैं।'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saveMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* Profile Card Main Body */}
        <div className="space-y-4">
          
          {/* Hero Avatar & Identity Card */}
          <div className="p-4 sm:p-5 bg-[#F8F9FA] dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center gap-4 relative overflow-hidden">
            
            {/* Avatar with Camera Overlay */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-600/60 dark:border-emerald-500/60 overflow-hidden flex items-center justify-center shadow-md">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    isSuperAdmin
                      ? 'bg-gradient-to-tr from-amber-600 to-amber-500'
                      : isAdmin
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                  }`}>
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <label
                className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white p-1.5 rounded-full shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title={lang === 'en' ? 'Upload Photo' : 'फ़ोटो बदलें'}
              >
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              </label>
            </div>

            {/* Name, Mobile & Status Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-lg text-slate-900 dark:text-white truncate">
                  {currentMember.name}
                </h4>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              </div>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{formatMobileNumber(currentMember.mobile)}</span>
              </p>

              {currentMember.email && (
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{currentMember.email}</span>
                </p>
              )}

              {/* Status and Role Badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {currentMember.status === 'active' ? (
                  <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-300 dark:border-emerald-800">
                    ✓ प्रमाणित सदस्य (Active)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-400 animate-pulse">
                    ⏳ अनुमोदन लंबित (Pending)
                  </span>
                )}

                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  isSuperAdmin
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : isAdmin
                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}>
                  {isSuperAdmin ? 'SUPER ADMIN' : isAdmin ? 'ADMIN' : 'MEMBER'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                setSelectedIdCardMember(currentMember);
                onClose();
              }}
              className="py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>{lang === 'en' ? 'Download ID Card' : '🪪 मेरा ID कार्ड डाउनलोड करें'}</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>{isEditing ? (lang === 'en' ? 'Cancel Edit' : 'रद्द करें (Cancel)') : (lang === 'en' ? 'Edit Details' : 'सम्पादित करें (Edit)')}</span>
            </button>
          </div>

          {/* Profile Details Form or View Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  👤 नाम (Full Name):
                </label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    पिता का नाम (Father's Name):
                  </label>
                  <Input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="श्री ..."
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    लिंग (Gender):
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">चुनें (Select Gender)</option>
                    <option value="Male">पुरुष (Male)</option>
                    <option value="Female">महिला (Female)</option>
                    <option value="Other">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    जन्म तिथि (Date of Birth):
                  </label>
                  <DatePicker
                    value={dob}
                    onChange={(val) => setDob(val)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ईमेल (Email):
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    व्यवसाय (Occupation):
                  </label>
                  <Input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="उदा. कृषक / छात्र / नौकरी"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    रक्त समूह (Blood Group):
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">चुनें (Select)</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  पता / निवास (Address):
                </label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  रद्द करें (Cancel)
                </button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'सहेजा जा रहा है...' : 'सुरक्षित करें (Save)'}</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-[#F8F9FA] dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 rounded-2xl divide-y divide-slate-200/60 dark:divide-slate-800 text-xs">
              
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  पिता का नाम:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {currentMember.fatherName || 'अद्यतन करें'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  जन्म तिथि:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {currentMember.dob || 'अद्यतन करें'}
                </span>
              </div>

              {currentMember.gender && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    लिंग:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {currentMember.gender === 'Male' ? 'पुरुष' : currentMember.gender === 'Female' ? 'महिला' : currentMember.gender}
                  </span>
                </div>
              )}

              {currentMember.occupation && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    व्यवसाय:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {currentMember.occupation}
                  </span>
                </div>
              )}

              {currentMember.bloodGroup && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Droplet className="w-3.5 h-3.5 text-rose-500" />
                    रक्त समूह:
                  </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {currentMember.bloodGroup}
                  </span>
                </div>
              )}

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  पता / निवास:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-right">
                  {currentMember.address || 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा'}
                </span>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-300">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              आपकी निजी जानकारी केवल आपको दिखाई देती है। अन्य सदस्य केवल आपका नाम और सार्वजनिक फ़ोटो देख सकते हैं।
            </span>
          </div>

        </div>
      </div>

      {/* Profile Photo Crop & Framing Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={pendingCropSrc}
        aspectRatio="square"
        onClose={() => {
          setIsCropperOpen(false);
          setPendingCropSrc(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
