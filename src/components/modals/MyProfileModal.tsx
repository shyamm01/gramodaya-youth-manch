'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, Shield, Camera, Edit3, Save, X, CheckCircle2, CreditCard, Lock, Phone, MapPin, Calendar, User } from 'lucide-react';
import { DigitalIdCard } from '../features/DigitalIdCard';
import { DatePicker } from '../ui';

export const MyProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    currentMemberMobile,
    members,
    authSession,
    uploadPhoto,
    refreshData,
    setSelectedIdCardMember,
  } = useApp();

  const currentMember = members.find((m) => {
    if (!currentMemberMobile) return false;
    const cleanM = (m.mobile || '').replace(/\D/g, '').slice(-10);
    const cleanCurr = currentMemberMobile.replace(/\D/g, '').slice(-10);
    return cleanM && cleanCurr && cleanCurr.length >= 10 && cleanM === cleanCurr;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

  useEffect(() => {
    if (currentMember) {
      setName(currentMember.name || '');
      setFatherName(currentMember.fatherName || '');
      setDob(currentMember.dob || '');
      setAddress(currentMember.address || 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा');
      setPhotoUrl(currentMember.photoUrl || '');
    }
  }, [currentMember, isOpen]);

  if (!isOpen || !currentMember) return null;

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
          address: address.trim(),
          photoUrl,
        }),
      });

      if (res.ok) {
        setSaveMsg('प्रोफाइल सफलता पूर्वक अद्यतन (Update) हो गई!');
        await refreshData();
        setIsEditing(false);
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('अद्यतन करने में त्रुटि हुई।');
      }
    } catch (e) {
      setSaveMsg('नेटवर्क त्रुटि हुई।');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoUrl(result);
        uploadPhoto('member', currentMember.id, result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E0DCCF] max-h-[90vh] overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E0DCCF] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#2C3327] text-amber-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#2C3327]">
                👤 मेरी प्रोफाइल (My Private Profile)
              </h3>
              <p className="text-[11px] text-[#8C8675] font-semibold">
                केवल आप ही अपनी निजी जानकारी देख व सम्पादित कर सकते हैं।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* Profile Card View */}
        <div className="space-y-4">
          {/* Avatar & Basic Banner */}
          <div className="flex items-center gap-4 p-4 bg-[#F7F5F0] border border-[#E0DCCF] rounded-2xl">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#4B634D] overflow-hidden flex items-center justify-center shadow-md">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-10 h-10 text-[#4B634D]" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-[#D97706] hover:bg-[#B45309] text-white p-1.5 rounded-full shadow cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-lg text-[#2C3327] truncate">{currentMember.name}</h4>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              </div>
              <p className="text-xs font-mono font-bold text-[#8C8675] flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-[#4B634D]" />
                <span>+91 {currentMember.mobile}</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                {currentMember.status === 'active' ? (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-300">
                    ✓ प्रमाणित सदस्य (Active)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full border border-amber-400 animate-pulse">
                    ⏳ अनुमोदन लंबित (Pending)
                  </span>
                )}
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-full border border-slate-300">
                  {currentMember.role || 'MEMBER'}
                </span>
              </div>
              {currentMember.status !== 'active' && (
                <p className="mt-2 text-[10px] font-medium text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  ⚠️ आपकी सदस्यता अभी एडमिन द्वारा समीक्षाधीन है। आप सभी सामग्री देख सकते हैं, तथा अनुमोदन के बाद नई प्रविष्टियां पोस्ट कर सकेंगे।
                </p>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setSelectedIdCardMember(currentMember);
                setShowIdCard(true);
              }}
              className="py-2.5 px-3 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>🪪 मेरा ID कार्ड डाउनलोड करें</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="py-2.5 px-3 bg-[#2C3327] hover:bg-[#3B4F3D] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>{isEditing ? 'रद्द करें (Cancel)' : 'सम्पादित करें (Edit)'}</span>
            </button>
          </div>

          {/* Details Form / View */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">
                  👤 नाम (Full Name):
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E0DCCF] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4B634D]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">
                  👨‍👦 पिता का नाम (Father's Name):
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E0DCCF] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4B634D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">
                  📅 जन्म तिथि (DOB):
                </label>
                <DatePicker
                  value={dob}
                  onChange={setDob}
                  placeholder="जन्म तिथि चुनें"
                  minYear={1930}
                  maxYear={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">
                  🏠 पता (Address):
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E0DCCF] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4B634D]"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-[#4B634D] hover:bg-[#3B4F3D] text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Save className="w-4 h-4" />
                <span>सुरक्षित करें (Save Changes)</span>
              </button>
            </form>
          ) : (
            <div className="bg-[#F7F5F0] border border-[#E0DCCF] rounded-2xl p-4 space-y-3 text-xs font-semibold text-[#2C3327]">
              <div className="flex items-center justify-between border-b border-[#E0DCCF] pb-2">
                <span className="text-[#8C8675] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#4B634D]" />
                  <span>पिता का नाम:</span>
                </span>
                <span className="font-bold">{currentMember.fatherName || 'अद्यतन करें'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#E0DCCF] pb-2">
                <span className="text-[#8C8675] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#4B634D]" />
                  <span>जन्म तिथि:</span>
                </span>
                <span className="font-bold font-mono">{currentMember.dob || 'अद्यतन करें'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#E0DCCF] pb-2">
                <span className="text-[#8C8675] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4B634D]" />
                  <span>पता / निवास:</span>
                </span>
                <span className="font-bold">{currentMember.address || 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा'}</span>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2 mt-2 font-medium">
                <Shield className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                <span>आपकी निजी जानकारी केवल आपको दिखाई देती है। अन्य सदस्य केवल आपका नाम और फोटो देख सकते हैं।</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showIdCard && (
        <DigitalIdCard
          member={currentMember}
          onClose={() => setShowIdCard(false)}
        />
      )}
    </div>
  );
};
