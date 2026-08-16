'use client';

import React, { useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Member, Village } from '../../types';
import { GymLogo } from '../common/GymLogo';
import {
  X,
  Camera,
  Download,
  Share2,
  Check,
  User,
  ShieldCheck,
  Printer,
  Calendar,
  PhoneCall,
  MapPin,
  Sparkles,
  Upload,
  Loader2,
  Layers,
  Award,
  Globe,
  Mail,
  CheckCheck,
  CheckCircle2,
  CreditCard,
  FileText,
  Languages,
  Fingerprint,
  Quote,
  Shield,
} from 'lucide-react';

interface DigitalIdCardProps {
  member: Member;
  onClose: () => void;
}

type CardLanguage = 'hi' | 'en';
type CardSide = 'FRONT' | 'BACK' | 'BOTH';

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ member, onClose }) => {
  const { uploadPhoto, members, villages, villageSettings } = useApp();
  const [cardLang, setCardLang] = useState<CardLanguage>('hi');
  const [activeTab, setActiveTab] = useState<CardSide>('FRONT');
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string>(member.photoUrl || '');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const isEn = cardLang === 'en';

  // 1. DYNAMIC VILLAGE & REGION RESOLUTION
  const matchedVillage: Partial<Village> = (villages && Array.isArray(villages)
    ? villages.find((v) => v.id === member.villageId || String(v.id) === String(member.villageId)) || villages[0]
    : {}) || {};

  const villageNameHi = matchedVillage.nameHindi || villageSettings?.nameHindi || 'रसूलपुर';
  const villageNameEn = matchedVillage.name || villageSettings?.name || 'Rasoolpur';
  const gpNameHi = matchedVillage.gramPanchayatNameHindi || villageSettings?.gramPanchayatHindi || 'बहेरा';
  const gpNameEn = matchedVillage.gramPanchayatName || villageSettings?.gramPanchayat || 'Bahera';
  const districtNameHi = matchedVillage.districtNameHindi || villageSettings?.districtHindi || 'वाराणसी';
  const districtNameEn = matchedVillage.districtName || villageSettings?.district || 'Varanasi';
  const stateNameHi = matchedVillage.stateNameHindi || villageSettings?.stateHindi || 'उत्तर प्रदेश';
  const stateNameEn = matchedVillage.stateName || villageSettings?.state || 'Uttar Pradesh';
  const pincode = member.pincode || matchedVillage.pincode || villageSettings?.pincode || '221301';

  // 2. DYNAMIC ORGANIZATION & HELPLINE SETTINGS
  const orgNameHi = member.organizationName || matchedVillage.orgNameHindi || villageSettings?.orgNameHindi || 'ग्रामोदय युवा मंच संगठन';
  const orgNameEn = matchedVillage.orgName || villageSettings?.orgName || 'GRAMODAYA YOUTH MANCH';
  const sloganHi = villageSettings?.sloganHindi || 'एकता • सेवा • संस्कार • विकास';
  const sloganEn = villageSettings?.slogan || 'Unity • Service • Values • Progress';
  const taglineHi = villageSettings?.taglineHindi || 'गाँव का विकास, युवाओं के साथ';
  const taglineEn = villageSettings?.tagline || 'Village Development With Youth Power';
  const helplineMobile = matchedVillage.contactMobile || '9450706183';
  const contactEmail = matchedVillage.contactEmail || 'gramodayayouthmanch@gmail.com';
  const website = 'www.gramodayayouthmanch.org';
  const missionStatementHi = villageSettings?.orgPurposeHindi || 'हमारा उद्देश्य समाज में एकता, शिक्षा, स्वास्थ्य, पर्यावरण, नशा मुक्ति, स्वच्छता और युवाओं के सर्वांगीण विकास के लिए कार्य करना है।';
  const missionStatementEn = 'Our mission is to work for rural education, health, environmental protection, anti-addiction, and youth development.';

  // 3. DYNAMIC MEMBER ATTRIBUTES
  const memberIndex = members.findIndex((m) => m.id === member.id);
  const memberNum = memberIndex >= 0 ? memberIndex + 1 : 1;
  const rawId = `GYM2026${String(memberNum).padStart(5, '0')}`;
  const aadhaarStyleId = `GYM 2026 ${String(memberNum).padStart(5, '0')}`;

  const hasDob = member.dob && member.dob.trim() && member.dob.trim() !== '—';
  const dob = hasDob ? member.dob!.trim() : '01/01/2000';

  const fatherName = member.fatherName && member.fatherName.trim() ? member.fatherName.trim() : '';
  const memberMobile = member.mobile && member.mobile.trim() ? member.mobile.trim() : '—';
  const memberName = member.name && member.name.trim() ? member.name.trim() : (isEn ? 'Registered Member' : 'पंजीकृत सदस्य');

  // Dynamic Gender
  const genderText = member.gender
    ? isEn
      ? member.gender.toLowerCase() === 'male'
        ? 'Male'
        : member.gender.toLowerCase() === 'female'
        ? 'Female'
        : member.gender
      : member.gender.toLowerCase() === 'male'
      ? 'पुरुष / Male'
      : member.gender.toLowerCase() === 'female'
      ? 'महिला / Female'
      : member.gender
    : isEn
    ? 'Member'
    : 'सदस्य';

  // Dynamic System & Member Role
  const isSuperAdmin = (member as any).systemRole === 'SUPER_ADMIN' || (member as any).role === 'SUPER_ADMIN';
  const isAdmin = (member as any).systemRole === 'ADMIN' || (member as any).role === 'ADMIN' || isSuperAdmin;
  const roleBadgeText = isSuperAdmin
    ? (isEn ? 'Super Admin' : 'मुख्य प्रशासक')
    : isAdmin
    ? (isEn ? 'Admin' : 'प्रशासक')
    : member.status === 'active'
    ? (isEn ? 'Active Member' : 'सक्रिय सदस्य')
    : (isEn ? 'Member' : 'सदस्य');

  // Dynamic Address Resolution
  const dynamicAddressHi = member.address && member.address.trim()
    ? member.address.trim()
    : [
        member.houseNo ? `म.नं. ${member.houseNo}` : '',
        member.street,
        `ग्राम ${villageNameHi}`,
        `ग्रा.पं. ${gpNameHi}`,
        `जनपद ${districtNameHi}`,
      ]
        .filter(Boolean)
        .join(', ');

  const dynamicAddressEn = member.address && member.address.trim()
    ? member.address.trim()
    : [
        member.houseNo ? `H.No. ${member.houseNo}` : '',
        member.street,
        `Vill. ${villageNameEn}`,
        `GP ${gpNameEn}`,
        `Dist. ${districtNameEn}`,
      ]
        .filter(Boolean)
        .join(', ');

  const address = isEn ? dynamicAddressEn : dynamicAddressHi;

  // Format creation or join date
  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return '01/08/2026';
    try {
      const cleanStr = dateStr.split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return '01/08/2026';
    } catch {
      return '01/08/2026';
    }
  };

  const joinDate = formatJoinDate(member.createdAt);

  // 4. DYNAMIC SCANNABLE QR CODE
  useEffect(() => {
    const qrString = isEn
      ? `ORGANIZATION: ${orgNameEn}
MEMBER ID: ${rawId}
NAME: ${memberName}
MOBILE: ${memberMobile}
DOB: ${dob}
GENDER: ${genderText}
ADDRESS: ${address}
PINCODE: ${pincode}
DISTRICT: ${districtNameEn}
JOIN DATE: ${joinDate}
ROLE: ${roleBadgeText}
STATUS: ${member.status || 'Active'}`
      : `संगठन: ${orgNameHi}
सदस्य ID: ${rawId}
नाम: ${memberName}
मोबाइल: ${memberMobile}
जन्म तिथि: ${dob}
लिंग: ${genderText}
पता: ${address}
पिनकोड: ${pincode}
जनपद: ${districtNameHi}
सदस्यता तिथि: ${joinDate}
पद/भूमिका: ${roleBadgeText}
स्थिति: ${member.status || 'Active'}`;

    QRCode.toDataURL(
      qrString,
      {
        margin: 1,
        width: 320,
        color: {
          dark: '#0B2E1C',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [
    member,
    rawId,
    memberName,
    memberMobile,
    dob,
    genderText,
    address,
    pincode,
    districtNameHi,
    districtNameEn,
    joinDate,
    roleBadgeText,
    isEn,
    orgNameHi,
    orgNameEn,
  ]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'gramodaya-youth-munch');
        formData.append('folder', 'profiles');
        formData.append('filename', `member_${member.id}_${Date.now()}.jpg`);

        const res = await fetch('/api/upload/supabase', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            setPreviewPhoto(data.url);
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload error:', err);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (previewPhoto) {
      await uploadPhoto('member', member.id, previewPhoto);
      setIsChangingPhoto(false);
    }
  };

  const handleDownload = async () => {
    const node = document.getElementById('id-card-download-wrapper');
    if (!node) return;

    setIsDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      const cleanName = memberName.trim().replace(/\s+/g, '_');
      link.download = `Gramodaya_ID_${cleanName}_${cardLang.toUpperCase()}_${activeTab}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed, falling back to window print:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = (langToPrint?: CardLanguage) => {
    if (langToPrint && langToPrint !== cardLang) {
      setCardLang(langToPrint);
      setTimeout(() => {
        window.print();
      }, 250);
    } else {
      window.print();
    }
  };

  const handleShare = () => {
    const text = isEn
      ? `🪪 *${orgNameEn} - Member Identity Card*\n\n👤 Name: ${memberName}\n🆔 Member ID: ${rawId}\n📞 Mobile: ${memberMobile}\n📅 DOB: ${dob}\n📍 Address: ${address}\n🗓️ Join Date: ${joinDate}\n🛡️ Role: ${roleBadgeText}\n\n🌱 ${taglineEn}.`
      : `🪪 *${orgNameHi} - सदस्य पहचान पत्र*\n\n👤 सदस्य का नाम: ${memberName}\n🆔 सदस्य ID: ${rawId}\n📞 मोबाइल: ${memberMobile}\n📅 जन्म तिथि: ${dob}\n📍 पता: ${address}\n🗓️ सदस्यता तिथि: ${joinDate}\n🛡️ पद/भूमिका: ${roleBadgeText}\n\n🌱 ${taglineHi}।`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isBoth = activeTab === 'BOTH';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Print Specific CSS to isolate only the card canvas */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #id-card-download-wrapper,
          #id-card-download-wrapper * {
            visibility: visible;
          }
          #id-card-download-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>

      <div className={`bg-[#072416] rounded-3xl w-full p-3 sm:p-5 shadow-2xl relative border-2 border-[#12422A] my-4 text-white print:border-none print:shadow-none print:bg-white print:p-0 transition-all duration-300 ${
        isBoth ? 'max-w-4xl' : 'max-w-xl'
      }`}>
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white p-2 rounded-full bg-black/60 hover:bg-black/80 transition cursor-pointer z-30 print:hidden"
          title={isEn ? 'Close' : 'बंद करें'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* TOP CONTROLS: 1. LANGUAGE SWITCHER & 2. SIDE TABS */}
        <div className="space-y-2.5 mb-4 print:hidden">
          {/* Row 1: Language Switcher with Aesthetic Icons */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-emerald-300/80 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Card Language:' : 'कार्ड भाषा:'}</span>
            </span>

            <div className="inline-flex rounded-xl p-1 bg-[#041a0f] border border-[#14482c] shadow-inner">
              <button
                type="button"
                onClick={() => setCardLang('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  cardLang === 'hi'
                    ? 'bg-amber-400 text-[#072416] shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#072416]" />
                <span>हिन्दी (Hindi)</span>
              </button>
              <button
                type="button"
                onClick={() => setCardLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  cardLang === 'en'
                    ? 'bg-amber-400 text-[#072416] shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe className="w-3 h-3 text-[#072416]" />
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Row 2: Front / Back / Both Side Tabs with Lucide Icons */}
          <div className="flex items-center justify-center gap-1.5 pr-8">
            {[
              { id: 'FRONT', label: isEn ? 'Front Side' : 'सामने (Front)', icon: CreditCard },
              { id: 'BACK', label: isEn ? 'Back Side' : 'पिछला (Back)', icon: FileText },
              { id: 'BOTH', label: isEn ? 'Both Sides' : 'दोनों (Both)', icon: Layers },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CardSide)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-stone-950 shadow-md'
                      : 'bg-[#103A25] text-white/80 hover:bg-[#185235]'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= DOWNLOADABLE & PRINTABLE WRAPPER ================= */}
        <div id="id-card-download-wrapper" className={`bg-[#072416] p-1 rounded-2xl print:bg-white print:p-0 ${
          isBoth 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch justify-center max-w-4xl mx-auto print:grid-cols-2 print:gap-4 print:max-w-none' 
            : 'space-y-4 max-w-md mx-auto'
        }`}>
          
          {/* ================= FRONT SIDE ID CARD (AADHAAR STYLE - FULLY DYNAMIC) ================= */}
          {(activeTab === 'FRONT' || isBoth) && (
            <div className={`bg-white text-slate-900 rounded-2xl overflow-hidden border-2 border-stone-300 shadow-2xl relative select-none flex flex-col justify-between h-full w-full print:border print:shadow-none ${
              isBoth ? 'mx-0' : 'mx-auto'
            } ${isEn ? 'font-sans antialiased tracking-normal' : 'font-sans antialiased'}`}>
              
              <div className="flex-1 flex flex-col">
                {/* 1. TOP HEADER BANNER (EMBLEM & DYNAMIC ORGANIZATION TITLES) */}
                <div className="bg-[#0B2E1C] text-white px-3 py-2.5 relative overflow-hidden border-b-2 border-amber-400">
                  <div className="flex items-center justify-between gap-2.5 relative z-10">
                    {/* Emblem Logo */}
                    <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-md border border-amber-400 shrink-0 flex items-center justify-center">
                      <GymLogo className="w-full h-full" />
                    </div>

                    {/* Centered Dynamic Organization Titles */}
                    <div className="flex-1 text-center min-w-0">
                      <h1 className="text-xs sm:text-sm font-black text-white tracking-wide leading-tight uppercase whitespace-nowrap truncate">
                        {isEn ? orgNameEn : orgNameHi}
                      </h1>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <span className="h-[1px] w-4 bg-amber-400"></span>
                        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                          {isEn ? 'Member Identity Card' : 'सदस्य पहचान पत्र'}
                        </span>
                        <span className="h-[1px] w-4 bg-amber-400"></span>
                      </div>
                      <p className="text-[8px] sm:text-[9px] text-emerald-200 font-medium tracking-tight whitespace-nowrap truncate mt-0.5">
                        {isEn ? sloganEn : sloganHi}
                      </p>
                    </div>

                    {/* Right Seal */}
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 shrink-0 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                    </div>
                  </div>

                  {/* Tricolor / Golden Accent Line */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />
                </div>

                {/* 2. CARD BODY (AADHAAR COMPOSITION: PHOTO LEFT, DETAILS CENTER, QR RIGHT) */}
                <div className="p-3 sm:p-3.5 bg-gradient-to-b from-slate-50 via-white to-amber-50/20 flex-1">
                  <div className="grid grid-cols-12 gap-3 items-start text-left">
                    
                    {/* LEFT COLUMN: DYNAMIC PHOTO & ROLE CAPSULE */}
                    <div className="col-span-4 flex flex-col items-center">
                      {/* Photo Frame */}
                      <div className="relative w-22 h-28 sm:w-24 sm:h-30 rounded-lg overflow-hidden border border-stone-400 bg-slate-100 shadow-sm">
                        {member.photoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={member.photoUrl} alt={memberName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-1 text-center bg-slate-100 text-slate-400">
                            <User className="w-8 h-8 text-slate-400" />
                            <span className="text-[8px] font-bold text-slate-600 mt-1">
                              {isEn ? 'Photo' : 'फोटो'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Aadhaar Style Dynamic Role Capsule */}
                      <div className="mt-1.5 w-full text-center">
                        <span className="inline-flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-400 px-2 py-0.5 rounded-full w-full shadow-2xs">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                          <span className="truncate">{roleBadgeText}</span>
                        </span>
                      </div>
                    </div>

                    {/* MIDDLE & RIGHT: DYNAMIC DETAILS & SCANNABLE QR */}
                    <div className="col-span-8 flex justify-between items-start gap-2">
                      {/* Member Details List */}
                      <div className="space-y-1.5 text-xs text-slate-800 font-medium flex-1 min-w-0">
                        {/* Dynamic Name */}
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
                            {isEn ? 'Name / नाम' : 'नाम / Name'}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wide leading-tight block truncate mt-0.5">
                            {memberName}
                          </span>
                        </div>

                        {/* Dynamic Father's Name */}
                        {fatherName ? (
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
                              {isEn ? 'Father Name' : 'पिता का नाम'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-800 block truncate mt-0.5">
                              {fatherName}
                            </span>
                          </div>
                        ) : null}

                        {/* Dynamic DOB & Gender */}
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
                              {isEn ? 'DOB' : 'जन्म तिथि'}
                            </span>
                            <span className="text-[11px] font-extrabold text-slate-900 font-mono block mt-0.5">
                              {dob}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
                              {isEn ? 'Gender' : 'लिंग'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-800 block mt-0.5">
                              {genderText}
                            </span>
                          </div>
                        </div>

                        {/* Dynamic Mobile */}
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
                            {isEn ? 'Mobile' : 'मोबाइल'}
                          </span>
                          <span className="text-[11px] font-bold text-slate-900 font-mono block mt-0.5">
                            {memberMobile}
                          </span>
                        </div>

                        {/* Dynamic Village / GP */}
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
                            {isEn ? 'Village / GP' : 'ग्राम / पंचायत'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-700 leading-snug line-clamp-2 block mt-0.5">
                            {address}
                          </span>
                        </div>
                      </div>

                      {/* Right Cluster: Live QR Code & Signature */}
                      <div className="shrink-0 flex flex-col items-center justify-start text-center">
                        {/* Live QR Code */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 bg-white p-0.5 rounded-md border border-stone-400 shadow-2xs flex items-center justify-center">
                          {qrDataUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[7px] font-mono text-slate-400">QR</span>
                          )}
                        </div>

                        {/* President Signature */}
                        <div className="mt-1 text-center">
                          <div className="h-4 flex items-center justify-center">
                            <svg className="w-12 h-4 text-[#0B2E1C]" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M 5 18 C 15 5, 25 22, 40 8 C 50 2, 60 20, 75 10 C 85 5, 90 15, 95 12" />
                            </svg>
                          </div>
                          <span className="text-[8px] font-bold text-slate-700 border-t border-slate-300 pt-0.5 block leading-none">
                            {isEn ? 'President' : 'अध्यक्ष'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* 3. DYNAMIC AADHAAR STYLE SECURITY MEMBER ID NUMBER BAR */}
                <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border-t-2 border-b-2 border-red-700/80 py-1.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-base sm:text-lg font-mono font-black tracking-widest text-slate-950">
                      {aadhaarStyleId}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. DYNAMIC FOOTER SLOGAN BANNER */}
              <div className="bg-[#0B2E1C] text-amber-300 py-1.5 px-3 text-center border-t border-amber-400/40 mt-auto">
                <p className="text-[10px] sm:text-[11px] font-bold tracking-wide">
                  {isEn ? `═ ${taglineEn} ═` : `═ ${taglineHi} ═`}
                </p>
              </div>
            </div>
          )}

          {/* ================= BACK SIDE ID CARD (AADHAAR STYLE - FULLY DYNAMIC) ================= */}
          {(activeTab === 'BACK' || isBoth) && (
            <div className={`bg-white text-slate-900 rounded-2xl overflow-hidden border-2 border-stone-300 shadow-2xl relative select-none flex flex-col justify-between h-full w-full print:border print:shadow-none ${
              isBoth ? 'mx-0' : 'mx-auto'
            } ${isEn ? 'font-sans antialiased tracking-normal' : 'font-sans antialiased'}`}>
              
              <div className="flex-1 flex flex-col">
                {/* 1. TOP HEADER BANNER */}
                <div className="bg-[#0B2E1C] text-white px-3 py-2.5 relative overflow-hidden border-b-2 border-amber-400">
                  <div className="flex items-center justify-between gap-2.5 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-amber-400 shrink-0 flex items-center justify-center shadow-md">
                      <GymLogo className="w-full h-full" />
                    </div>
                    <div className="flex-1 text-center min-w-0">
                      <h2 className="text-xs sm:text-sm font-black text-white leading-tight uppercase whitespace-nowrap truncate">
                        {isEn ? orgNameEn : orgNameHi}
                      </h2>
                      <p className="text-[9px] text-amber-300 font-bold uppercase tracking-wider mt-0.5">
                        {isEn ? 'Membership Information & Rules' : 'सदस्यता विवरण एवं नियम'}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 shrink-0 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />
                </div>

                {/* 2. DYNAMIC ADDRESS & OBJECTIVE SECTION (AADHAAR BACK STYLE) */}
                <div className="p-3 sm:p-3.5 space-y-2.5 text-left bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 flex-1">
                  
                  {/* Dynamic Address Box */}
                  <div className="p-2 bg-white rounded-lg border border-stone-300 shadow-2xs">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider block leading-none mb-1">
                      {isEn ? 'Full Residential Address / पूर्ण निवास पता:' : 'पता / Full Address:'}
                    </span>
                    <p className="text-[11px] font-bold text-slate-900 leading-snug">
                      {address}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      {isEn
                        ? `Pincode: ${pincode} • District: ${districtNameEn} • State: ${stateNameEn}`
                        : `पिनकोड: ${pincode} • जनपद: ${districtNameHi} • राज्य: ${stateNameHi}`}
                    </p>
                  </div>

                  {/* Dynamic Mission Statement */}
                  <div className="p-2 bg-emerald-50/70 rounded-lg border border-emerald-200">
                    <p className="text-[10px] font-medium text-[#0B2E1C] leading-tight">
                      {isEn
                        ? `Mission: ${missionStatementEn}`
                        : `उद्देश्य: ${missionStatementHi}`}
                    </p>
                  </div>

                  {/* Rights & Duties Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                    {/* Rights */}
                    <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
                      <span className="font-bold text-[#0B2E1C] block mb-1">
                        {isEn ? '• Member Rights' : '• सदस्य के अधिकार'}
                      </span>
                      <ul className="space-y-0.5 text-slate-700">
                        <li>✓ {isEn ? 'Participate in initiatives' : 'गतिविधियों में सहभागिता'}</li>
                        <li>✓ {isEn ? 'Welfare & community aid' : 'सुविधाओं व सहयोग का लाभ'}</li>
                        <li>✓ {isEn ? 'Give suggestions freely' : 'सुझाव देने का अधिकार'}</li>
                      </ul>
                    </div>

                    {/* Duties */}
                    <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
                      <span className="font-bold text-[#0B2E1C] block mb-1">
                        {isEn ? '• Member Duties' : '• सदस्य के कर्तव्य'}
                      </span>
                      <ul className="space-y-0.5 text-slate-700">
                        <li>✓ {isEn ? 'Follow Manch values' : 'नियमों व अनुशासन का पालन'}</li>
                        <li>✓ {isEn ? 'Active social work' : 'समाज सेवा में सक्रिय योगदान'}</li>
                        <li>✓ {isEn ? 'Uphold unity & dignity' : 'एकता व गरिमा बनाए रखना'}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Dynamic Emergency Helpline & Verification Bar */}
                  <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#0B2E1C] text-amber-300 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase block leading-none">
                          {isEn ? 'Helpline' : 'हेल्पलाइन'}
                        </span>
                        <span className="font-black text-[#0B2E1C] font-mono text-[11px] block mt-0.5">{helplineMobile}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="h-4 flex items-center justify-center">
                        <svg className="w-12 h-4 text-[#0B2E1C]" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M 5 18 C 15 5, 25 22, 40 8 C 50 2, 60 20, 75 10 C 85 5, 90 15, 95 12" />
                        </svg>
                      </div>
                      <span className="text-[8px] font-bold text-slate-700 border-t border-slate-300 pt-0.5 block leading-none">
                        {isEn ? 'President' : 'अध्यक्ष'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* 3. DYNAMIC AADHAAR STYLE BOTTOM ID BAR */}
                <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border-t-2 border-b-2 border-red-700/80 py-1.5 px-3 text-center">
                  <span className="text-base sm:text-lg font-mono font-black tracking-widest text-slate-950">
                    {aadhaarStyleId}
                  </span>
                </div>
              </div>

              {/* 4. DYNAMIC FOOTER CONTACT BAR */}
              <div className="bg-[#0B2E1C] text-emerald-100 py-1.5 px-3 text-center text-[9px] font-mono flex items-center justify-around border-t border-amber-400/40 mt-auto">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-amber-400" />
                  <span>{website}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-400" />
                  <span>{contactEmail}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Change Photo Sub-Modal */}
        {isChangingPhoto && (
          <div className="mt-4 p-4 bg-white text-slate-900 rounded-2xl border border-amber-400 text-center animate-fade-in shadow-xl print:hidden">
            <h4 className="text-xs font-bold text-[#0B2E1C] mb-2 flex items-center justify-center gap-1">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>{isEn ? 'Upload Member Photo' : 'प्रोफाइल फोटो अपलोड करें'}</span>
            </h4>
            <div className="w-24 h-24 rounded-2xl mx-auto overflow-hidden border-2 border-[#0B2E1C] mb-3 bg-slate-100 flex items-center justify-center shadow-inner">
              {previewPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <label className="block w-full py-2 px-3 bg-[#0B2E1C] hover:bg-[#1B4D33] text-white text-xs font-bold rounded-xl cursor-pointer transition mb-3">
              <span className="flex items-center justify-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-300" />
                <span>{isEn ? 'Choose Photo' : 'फ़ोटो चुनें (Choose Photo)'}</span>
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsChangingPhoto(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                {isEn ? 'Cancel' : 'रद्द करें'}
              </button>
              <button
                onClick={handleSavePhoto}
                className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow cursor-pointer transition"
              >
                {isEn ? 'Save' : 'सहेजें (Save)'}
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS: CLEAN 3-BUTTON ACTION BAR */}
        <div className="mt-4 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Print Button */}
            <button
              onClick={() => handlePrint(cardLang)}
              className="h-11 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer border border-emerald-500/40"
              title={isEn ? "Print ID Card" : "ID कार्ड प्रिंट करें"}
            >
              <Printer className="w-4 h-4 text-emerald-200 shrink-0" />
              <span className="whitespace-nowrap truncate">{isEn ? 'Print ID Card' : 'ID प्रिंट करें'}</span>
            </button>

            {/* 2. Download PNG Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-11 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="whitespace-nowrap truncate">{isEn ? 'Downloading...' : 'डाउनलोड हो रहा है...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-stone-950 shrink-0" />
                  <span className="whitespace-nowrap truncate">{isEn ? 'Download PNG' : 'डाउनलोड PNG'}</span>
                </>
              )}
            </button>

            {/* 3. Share / Copy Button */}
            <button
              onClick={handleShare}
              className="h-11 px-4 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer border border-white/15 backdrop-blur-sm"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap truncate text-emerald-300">{isEn ? 'Copied!' : 'कॉपी हो गया!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-stone-300 shrink-0" />
                  <span className="whitespace-nowrap truncate">{isEn ? 'Share Details' : 'शेयर करें'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
