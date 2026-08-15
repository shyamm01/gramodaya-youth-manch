'use client';
import React, { useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { GymLogo } from '../common/GymLogo';
import {
  X,
  Camera,
  Download,
  Share2,
  Check,
  User,
  ShieldCheck,
  Eye,
  Calendar,
  Phone,
  Building2,
  MapPin,
  Sparkles,
  Upload,
  Loader2,
  Lock,
  Layers,
  Heart,
  Award,
} from 'lucide-react';

interface DigitalIdCardProps {
  member: Member;
  onClose: () => void;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ member, onClose }) => {
  const { uploadPhoto, members, authSession, currentMemberMobile, villageSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'FRONT' | 'BACK' | 'BOTH'>('FRONT');
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string>(member.photoUrl || '');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Check if current logged-in user is the owner of this card or an admin
  const currentLoggedInMember = members.find((m) => {
    if (!currentMemberMobile) return false;
    const cleanM = (m.mobile || '').replace(/\D/g, '').slice(-10);
    const cleanCurr = currentMemberMobile.replace(/\D/g, '').slice(-10);
    return cleanM && cleanCurr && cleanCurr.length >= 10 && cleanM === cleanCurr;
  });
  const isOwner = currentLoggedInMember?.id === member.id;
  const canEditPhoto = false;

  // Sanghthan Name
  const sanghthanName = member.organizationName || villageSettings.orgNameHindi || 'ग्रामोदय युवा मंच';

  // Compute clean Member ID
  const memberIndex = members.findIndex((m) => m.id === member.id);
  const memberNum = memberIndex >= 0 ? memberIndex + 1 : 1;
  const formattedMemberId = `GYM2026${String(memberNum).padStart(5, '0')}`;

  // Member default fallback values matching official village data
  const dob = member.dob && member.dob.trim() ? member.dob.trim() : '—';
  const address = member.address && member.address.trim() ? member.address.trim() : 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा';

  // Format creation or join date (Default to 01-08-2026)
  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return '01-08-2026';
    try {
      const cleanStr = dateStr.split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return '01-08-2026';
    } catch {
      return '01-08-2026';
    }
  };

  const joinDate = formatJoinDate(member.createdAt);

  // Generate Scannable QR Code containing complete member details
  useEffect(() => {
    const qrPayload = {
      Organization: 'ग्रामोदय युवा मंच संगठन',
      MemberID: formattedMemberId,
      Name: member.name,
      Mobile: member.mobile,
      DOB: dob,
      Address: address,
      JoiningDate: joinDate,
      Status: member.status === 'active' ? 'प्रमाणित व सक्रिय सदस्य (Active Member)' : 'लंबित (Pending)',
      VerificationURL: window.location.href,
    };

    const qrString = `संगठन: ग्रामोदय युवा मंच
सदस्य ID: ${formattedMemberId}
नाम: ${member.name}
मोबाइल: ${member.mobile}
जन्म तिथि: ${dob}
पता: ${address}
सदस्यता तिथि: ${joinDate}
स्थिति: सक्रिय सदस्य (Verified Active Member)`;

    QRCode.toDataURL(
      qrString,
      {
        margin: 1,
        width: 300,
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
  }, [member, formattedMemberId, dob, address, joinDate]);

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
      const cleanName = member.name.trim().replace(/\s+/g, '_');
      link.download = `Gramodaya_ID_Card_${cleanName}_${activeTab}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed, falling back to window print:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `🪪 *ग्रामोदय युवा मंच संगठन - सदस्य पहचान पत्र*\n\n👤 सदस्य का नाम: ${member.name}\n🆔 सदस्य ID: ${formattedMemberId}\n📞 मोबाइल: ${member.mobile}\n📅 जन्म तिथि: ${dob}\n📍 पता: ${address}\n🗓️ सदस्यता तिथि: ${joinDate}\n🛡️ स्थिति: सक्रिय सदस्य (Active Member)\n\n🌱 गाँव का विकास, युवाओं के साथ।`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#072416] rounded-3xl max-w-xl w-full p-3 sm:p-5 shadow-2xl relative border-2 border-[#12422A] my-4 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white p-2 rounded-full bg-black/60 hover:bg-black/80 transition cursor-pointer z-30"
          title="बंद करें"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TOP TAB CONTROLS (FRONT / BACK / BOTH) */}
        <div className="flex items-center justify-center gap-2 mb-4 pr-10">
          {[
            { id: 'FRONT', label: '🪪 सामने का भाग (Front)' },
            { id: 'BACK', label: '📜 पिछला भाग (Back)' },
            { id: 'BOTH', label: '📑 दोनों भाग (Both)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-[#072416] shadow-md scale-105'
                  : 'bg-[#103A25] text-white/80 hover:bg-[#185235]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DOWNLOADABLE WRAPPER */}
        <div id="id-card-download-wrapper" className="space-y-4 bg-[#072416] p-1 rounded-2xl">
          {/* ================= FRONT SIDE ID CARD (EXACT MATCH TO ATTACHED DESIGN) ================= */}
          {(activeTab === 'FRONT' || activeTab === 'BOTH') && (
            <div className="bg-white text-slate-900 rounded-2xl overflow-hidden border-4 border-[#0F2A1C] shadow-2xl relative select-none font-sans max-w-md mx-auto">
              
              {/* 1. TOP HEADER BANNER */}
              <div className="bg-[#0B2E1C] text-white p-3.5 relative overflow-hidden border-b-2 border-amber-400/40">
                <div className="flex items-center gap-3 relative z-10">
                  {/* Tree Logo Left */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-md border-2 border-amber-400 flex-shrink-0 flex flex-col items-center justify-center text-center">
                    <GymLogo className="w-full h-full" />
                  </div>

                  {/* Header Titles */}
                  <div className="flex-1 text-left">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide leading-none">
                      ग्रामोदय युवा मंच
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="h-[2px] w-6 bg-amber-400"></span>
                      <span className="text-amber-300 font-extrabold text-sm tracking-wider uppercase">संगठन</span>
                      <span className="h-[2px] w-6 bg-amber-400"></span>
                    </div>
                    <p className="text-[11px] text-emerald-200 font-bold mt-0.5 tracking-tight">
                      एकता • सेवा • संस्कार • विकास
                    </p>
                  </div>
                </div>

                {/* Curved bottom accent */}
                <div className="absolute -bottom-3 inset-x-0 h-4 bg-amber-400/20 rounded-t-full"></div>
              </div>

              {/* 2. MEMBER ID CARD BADGE */}
              <div className="bg-[#0B2E1C] py-1.5 text-center border-t border-b border-amber-400">
                <span className="inline-block bg-[#0B2E1C] text-amber-300 font-black text-xs px-5 py-0.5 rounded-full border border-amber-400 shadow-xs uppercase tracking-widest">
                  सदस्य पहचान पत्र / MEMBER ID CARD
                </span>
              </div>

              {/* 3. CARD BODY (2-COLUMN MATCHING ATTACHED IMAGE) */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-b from-white via-slate-50 to-emerald-50/20 grid grid-cols-12 gap-3 items-start text-left">
                
                {/* LEFT COLUMN: MEMBER DETAILS LIST */}
                <div className="col-span-7 space-y-2.5 text-xs text-slate-800 font-medium">
                  
                  {/* Field 1: Member ID */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0B2E1C] text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block leading-none">सदस्य ID</span>
                      <span className="font-black text-slate-900 font-mono text-xs sm:text-sm">{formattedMemberId}</span>
                    </div>
                  </div>

                  {/* Field 2: DOB */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0B2E1C] text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block leading-none">जन्म तिथि</span>
                      <span className="font-extrabold text-slate-900 font-mono">{dob}</span>
                    </div>
                  </div>

                  {/* Field 3: Address */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0B2E1C] text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block leading-none">निवास स्थान</span>
                      <span className="font-extrabold text-slate-900 text-[11px] leading-tight block">{address}</span>
                    </div>
                  </div>

                  {/* Field 4: Mobile */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0B2E1C] text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block leading-none">मोबाइल नंबर</span>
                      <span className="font-black text-slate-900 font-mono text-xs">{member.mobile}</span>
                    </div>
                  </div>

                  {/* Field 5: Joining Date */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0B2E1C] text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block leading-none">सदस्यता तिथि</span>
                      <span className="font-extrabold text-slate-900 font-mono">{joinDate}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: PHOTO, NAME, STATUS & SCANNABLE QR CODE */}
                <div className="col-span-5 text-center flex flex-col items-center">
                  
                  {/* Member Photo */}
                  <div className="relative w-28 h-32 sm:w-32 sm:h-36 rounded-xl overflow-hidden border-2 border-[#0B2E1C] bg-slate-100 shadow-md mb-1.5">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        onClick={() => canEditPhoto && setIsChangingPhoto(true)}
                        className={`flex flex-col items-center justify-center h-full p-1 text-center bg-slate-100 text-slate-400 ${
                          canEditPhoto ? 'cursor-pointer' : ''
                        }`}
                      >
                        <User className="w-10 h-10 mb-1 text-slate-400" />
                        {canEditPhoto && <span className="text-[9px] font-bold text-slate-600">फोटो चुनें</span>}
                      </div>
                    )}
                    {canEditPhoto && (
                      <button
                        onClick={() => setIsChangingPhoto(true)}
                        className="absolute bottom-1 right-1 bg-amber-500 hover:bg-amber-600 text-white p-1 rounded-full shadow border border-white cursor-pointer"
                        title="फोटो बदलें"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Member Name in Capital Bold */}
                  <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-wide uppercase leading-tight">
                    {member.name}
                  </h3>
                  
                  {/* Status Badge */}
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full mt-0.5 mb-2 block">
                    सक्रिय सदस्य (Active Member)
                  </span>

                  {/* Scannable Real QR Code & Signature */}
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {/* Real QR Code image generated from details */}
                    <div className="w-18 h-18 sm:w-20 sm:h-20 bg-white p-1 rounded-lg border-2 border-[#0B2E1C] shadow-xs flex flex-col items-center justify-center">
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[8px] font-mono font-bold text-slate-400">QR Loading</span>
                      )}
                      <span className="text-[7px] font-mono font-bold text-[#0B2E1C] mt-0.5">{formattedMemberId}</span>
                    </div>

                    {/* Authorized Signature */}
                    <div className="text-center flex flex-col items-center justify-center">
                      <div className="h-5 flex items-center justify-center">
                        <svg className="w-16 h-5 text-[#0B2E1C]" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M 5 18 C 15 5, 25 22, 40 8 C 50 2, 60 20, 75 10 C 85 5, 90 15, 95 12" />
                        </svg>
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-900 border-t border-slate-400 pt-0.5 block leading-none">
                        अध्यक्ष
                      </span>
                      <span className="text-[7px] font-bold text-[#0B2E1C]">ग्रामोदय युवा मंच संगठन</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* 4. FOOTER BANNER */}
              <div className="bg-[#0B2E1C] text-amber-300 py-2 px-3 text-center border-t border-amber-400/50">
                <p className="text-xs font-black tracking-wide">
                  ═ गाँव का विकास, युवाओं के साथ ═
                </p>
              </div>
            </div>
          )}

          {/* ================= BACK SIDE ID CARD (EXACT MATCH TO ATTACHED DESIGN) ================= */}
          {(activeTab === 'BACK' || activeTab === 'BOTH') && (
            <div className="bg-white text-slate-900 rounded-2xl overflow-hidden border-4 border-[#0F2A1C] shadow-2xl relative select-none font-sans max-w-md mx-auto">
              
              {/* 1. TOP HEADER BANNER */}
              <div className="bg-[#0B2E1C] text-white p-3 text-center relative overflow-hidden border-b-2 border-amber-400">
                <div className="flex items-center justify-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-white p-1 border-2 border-amber-400 flex-shrink-0 flex items-center justify-center shadow-xs">
                    <GymLogo className="w-full h-full" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg sm:text-xl font-black text-white leading-none">
                      ग्रामोदय युवा मंच
                    </h2>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="h-[2px] w-4 bg-amber-400"></span>
                      <span className="text-amber-300 font-extrabold text-xs uppercase tracking-wider">संगठन</span>
                      <span className="h-[2px] w-4 bg-amber-400"></span>
                    </div>
                    <p className="text-[9px] text-emerald-200 font-bold uppercase tracking-widest mt-0.5">
                      GRAMODAYA YOUTH MANCH SANGATHAN
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. MAIN OBJECTIVE STATEMENT */}
              <div className="p-3 bg-emerald-50/60 border-b border-emerald-200 text-center">
                <p className="text-xs font-bold text-[#0B2E1C] leading-relaxed">
                  " हमारा उद्देश्य समाज में एकता, शिक्षा, स्वास्थ्य, पर्यावरण, नशा मुक्ति, स्वच्छता और युवाओं के सर्वांगीण विकास के लिए कार्य करना है। "
                </p>
              </div>

              {/* 3. RIGHTS & DUTIES (2 SECTIONS) */}
              <div className="p-3 sm:p-4 space-y-3 text-left">
                
                {/* SECTION 1: RIGHTS OF MEMBER */}
                <div>
                  <div className="inline-block bg-[#0B2E1C] text-amber-300 text-[11px] font-black px-3 py-0.5 rounded-md mb-1.5 shadow-xs">
                    सदस्य के अधिकार
                  </div>
                  <ul className="space-y-1 text-xs text-slate-800 font-medium pl-1">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] flex-shrink-0 mt-0.5" />
                      <span>संगठन की सभी गतिविधियों में भाग लेने का अधिकार</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] flex-shrink-0 mt-0.5" />
                      <span>सदस्यता द्वारा मिलने वाली सुविधाओं का लाभ</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] flex-shrink-0 mt-0.5" />
                      <span>सुझाव देने एवं संगठन के विकास में सहयोग</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] flex-shrink-0 mt-0.5" />
                      <span>सम्मान व विश्वास के साथ कार्य करने का अवसर</span>
                    </li>
                  </ul>
                </div>

                {/* SECTION 2: DUTIES OF MEMBER */}
                <div>
                  <div className="inline-block bg-[#0B2E1C] text-amber-300 text-[11px] font-black px-3 py-0.5 rounded-md mb-1.5 shadow-xs">
                    सदस्य के कर्तव्य
                  </div>
                  <ul className="space-y-1 text-xs text-slate-800 font-medium pl-1">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] flex-shrink-0 mt-0.5" />
                      <span>संगठन के उद्देश्यों एवं नियमों का पालन करना</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] flex-shrink-0 mt-0.5" />
                      <span>समाज सेवा कार्यों में सक्रिय भाग लेना</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] flex-shrink-0 mt-0.5" />
                      <span>संगठन की छवि व गरिमा को बनाए रखना</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] flex-shrink-0 mt-0.5" />
                      <span>एकता, सेवा, संस्कार और विकास के मूल्यों को बढ़ाना</span>
                    </li>
                  </ul>
                </div>

                {/* EMERGENCY CONTACT & SIGNATURE */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-[#0B2E1C] text-amber-300 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase block leading-none">आपातकालीन संपर्क</span>
                      <span className="font-black text-[#0B2E1C] font-mono text-xs">9450706183</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="h-4 flex items-center justify-center">
                      <svg className="w-16 h-4 text-[#0B2E1C]" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 5 18 C 15 5, 25 22, 40 8 C 50 2, 60 20, 75 10 C 85 5, 90 15, 95 12" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-900 border-t border-slate-400 pt-0.5 block leading-none">
                      अध्यक्ष
                    </span>
                    <span className="text-[7px] font-bold text-[#0B2E1C]">ग्रामोदय युवा मंच संगठन</span>
                  </div>
                </div>

              </div>

              {/* 4. FOOTER CONTACT BAR */}
              <div className="bg-[#0B2E1C] text-emerald-100 py-1.5 px-2 text-center text-[10px] font-mono flex items-center justify-around border-t border-amber-400/40">
                <span>🌐 www.gramodayayouthmanch.org</span>
                <span>✉️ gramodayayouthmanch@gmail.com</span>
              </div>
            </div>
          )}
        </div>

        {/* Change Photo Sub-Modal */}
        {isChangingPhoto && (
          <div className="mt-4 p-4 bg-white text-slate-900 rounded-2xl border border-amber-400 text-center animate-fade-in shadow-xl">
            <h4 className="text-xs font-bold text-[#0B2E1C] mb-2 flex items-center justify-center gap-1">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>प्रोफाइल फोटो अपलोड करें (Upload Member Photo)</span>
            </h4>
            <div className="w-24 h-24 rounded-2xl mx-auto overflow-hidden border-2 border-[#0B2E1C] mb-3 bg-slate-100 flex items-center justify-center shadow-inner">
              {previewPhoto ? (
                <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <label className="block w-full py-2 px-3 bg-[#0B2E1C] hover:bg-[#1B4D33] text-white text-xs font-bold rounded-xl cursor-pointer transition mb-3">
              <span className="flex items-center justify-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-300" />
                <span>फ़ोटो चुनें (Choose Photo)</span>
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsChangingPhoto(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleSavePhoto}
                className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow cursor-pointer transition"
              >
                सहेजें (Save)
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer border border-emerald-600 shadow-md"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>ID प्रिंट करें</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-70"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>डाउनलोड हो रहा है...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>डाउनलोड PNG ({activeTab})</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-100 text-[#0B2E1C] rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'कॉपी हो गया!' : 'शेयर करें'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
