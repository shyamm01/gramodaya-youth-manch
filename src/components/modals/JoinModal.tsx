'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import {
  JoinModalHeader,
  JoinStepAuth,
  JoinAuthMethod,
  JoinStepPersonal,
  JoinStepBackground,
  JoinStepSuccess,
} from './join';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  const {
    addMember,
    sendMemberOtp,
    verifyMemberOtp,
    villageSettings,
    villages,
    activeVillageId,
    setSelectedIdCardMember,
    t,
    lang,
  } = useApp();

  // Wizard Step: 1 = Auth (OTP / Password / OAuth), 2 = Personal Details, 3 = Background & Pledge, 4 = Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [authMethod, setAuthMethod] = useState<JoinAuthMethod>('otp');

  // Step 1: Mobile & OTP State
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Step 1: Password Auth State
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Personal Details State
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    activeVillageId || 'vil_rasoolpur'
  );
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Step 3: Optional Background State
  const [occupation, setOccupation] = useState('');
  const [designation, setDesignation] = useState('');
  const [politicalBackground, setPoliticalBackground] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [pledgeAccepted, setPledgeAccepted] = useState(true);

  // Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Clean Mobile Digits
  const cleanMobileDigits = (mobile || emailOrMobile.replace(/\D/g, '')).slice(-10);
  const isMobileValid = cleanMobileDigits.length === 10;

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Selected Village Information
  const selectedVillageObj = useMemo(() => {
    return (
      (villages || []).find((v) => v.id === selectedVillageId) ||
      villages[0] || {
        nameHindi: villageSettings.nameHindi || 'रसूलपुर',
        name: villageSettings.name || 'Rasoolpur',
        gramPanchayatName: villageSettings.gramPanchayat || 'Bahera',
        gramPanchayatNameHindi: villageSettings.gramPanchayatHindi || 'बहेरा',
        districtName: villageSettings.district || 'Jaunpur',
        districtNameHindi: villageSettings.districtHindi || 'जौनपुर',
      }
    );
  }, [villages, selectedVillageId, villageSettings]);

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (!isMobileValid) {
      setError(
        lang === 'en'
          ? 'Please enter a valid 10-digit mobile number.'
          : 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।'
      );
      return;
    }

    setIsSendingOtp(true);
    setError('');

    const res = await sendMemberOtp(cleanMobileDigits);
    setIsSendingOtp(false);

    if (res.success) {
      setIsOtpSent(true);
      setResendTimer(60);
    } else {
      setError(res.error || (lang === 'en' ? 'Failed to send OTP.' : 'ओटीपी भेजने में त्रुटि हुई।'));
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError(lang === 'en' ? 'Please enter 6-digit OTP.' : 'कृपया 6-अंकीय ओटीपी कोड दर्ज करें।');
      return;
    }

    setIsVerifyingOtp(true);
    setError('');

    const res = await verifyMemberOtp(cleanMobileDigits, otpCode.trim());
    setIsVerifyingOtp(false);

    if (res.success) {
      setCurrentStep(2);
    } else {
      setError(res.error || (lang === 'en' ? 'Invalid OTP code.' : 'अमान्य ओटीपी कोड दर्ज किया गया।'));
    }
  };

  // Handle Password-based Step 1 verification
  const handleVerifyPasswordAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrMobile.trim()) {
      setError(lang === 'en' ? 'Please enter mobile or email.' : 'कृपया मोबाइल नंबर या ईमेल दर्ज करें।');
      return;
    }
    if (password.length < 6) {
      setError(lang === 'en' ? 'Password must be at least 6 characters.' : 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।');
      return;
    }

    setError('');
    // If mobile number was provided in emailOrMobile, sync to mobile state
    const digits = emailOrMobile.replace(/\D/g, '').slice(-10);
    if (digits.length === 10) {
      setMobile(digits);
    }
    setCurrentStep(2);
  };

  // Handle OAuth Success
  const handleOAuthSuccess = (provider: string, email?: string, oAuthName?: string) => {
    setError('');
    if (oAuthName) setName(oAuthName);
    if (email && !emailOrMobile) setEmailOrMobile(email);
    setCurrentStep(2);
  };

  // Handle Photo Picker
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(
          lang === 'en'
            ? 'Photo size must be under 5MB.'
            : 'फ़ोटो का आकार 5MB से कम होना चाहिए।'
        );
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 2 Next Validation
  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(lang === 'en' ? 'Please enter member full name.' : 'कृपया सदस्य का पूरा नाम दर्ज करें।');
      return;
    }
    setError('');
    setCurrentStep(3);
  };

  // Step 3 Submit
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(lang === 'en' ? 'Please enter member name.' : 'कृपया सदस्य का नाम भरें।');
      setCurrentStep(2);
      return;
    }
    if (!pledgeAccepted) {
      setError(lang === 'en' ? 'Please accept the membership pledge.' : 'कृपया सदस्यता संकल्प पत्र स्वीकार करें।');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setAlreadyRegistered(false);

    const effectiveMobile =
      cleanMobileDigits.length === 10
        ? `+91 ${cleanMobileDigits.slice(0, 5)} ${cleanMobileDigits.slice(5)}`
        : emailOrMobile || `+91 98765 00000`;

    const res = await addMember({
      name: name.trim(),
      mobile: effectiveMobile,
      photoUrl,
      fatherName: fatherName.trim(),
      dob: dob.trim(),
      address:
        address.trim() ||
        `${lang === 'en' ? 'Village ' + (selectedVillageObj.name || 'Rasoolpur') : 'ग्राम ' + (selectedVillageObj.nameHindi || 'रसूलपुर')}`,
      villageId: selectedVillageId,
      occupation: occupation.trim(),
      designation: designation.trim(),
      politicalBackground: politicalBackground.trim(),
      bloodGroup: bloodGroup.trim(),
      organizationName: villageSettings.orgNameHindi || 'ग्रामोदय यूथ मंच',
      joiningDate: new Date().toISOString().split('T')[0],
    });

    setIsSubmitting(false);

    if (res.success && res.member) {
      setRegisteredMember(res.member);
      setCurrentStep(4);
    } else if (res.alreadyRegistered && res.member) {
      setRegisteredMember(res.member);
      setAlreadyRegistered(true);
      setError(
        res.error ||
          (lang === 'en'
            ? 'This mobile number is already registered.'
            : 'यह मोबाइल नंबर पहले से पंजीकृत है।')
      );
      setCurrentStep(4);
    } else {
      setError(
        res.error ||
          (lang === 'en'
            ? 'Error during registration. Please try again.'
            : 'पंजीकरण करने में त्रुटि हुई। कृपया पुनः प्रयास करें।')
      );
    }
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    setAuthMethod('otp');
    setMobile('');
    setOtpCode('');
    setIsOtpSent(false);
    setEmailOrMobile('');
    setPassword('');
    setName('');
    setFatherName('');
    setDob('');
    setAddress('');
    setPhotoUrl('');
    setOccupation('');
    setDesignation('');
    setPoliticalBackground('');
    setBloodGroup('');
    setError('');
    setRegisteredMember(null);
    setAlreadyRegistered(false);
    onClose();
  };

  const handleOpenMyDigitalCard = () => {
    if (registeredMember) {
      setSelectedIdCardMember(registeredMember);
      onClose();
    }
  };

  const handleShareWhatsApp = () => {
    if (!registeredMember) return;
    const text = encodeURIComponent(
      `🌱 *${villageSettings.orgNameHindi || 'ग्रामोदय यूथ मंच'} — ${t('join.tag')}*\n\n` +
        `👤 *${t('join.applicantName')}* ${registeredMember.name}\n` +
        `📍 *${t('join.villageUnit')}* ${lang === 'en' ? selectedVillageObj.name : selectedVillageObj.nameHindi}\n` +
        `📞 *${t('join.registeredMobile')}* ${registeredMember.mobile}\n` +
        (occupation ? `💼 *पेशा/व्यवसाय:* ${occupation}\n` : '') +
        `✅ ${lang === 'en' ? 'I have joined Gramodaya Youth Manch! Connect for village development.' : 'मैंने ग्रामोदय यूथ मंच की सदस्यता ले ली है। आप भी जुड़ें!'}\n\n` +
        `🌐 ${typeof window !== 'undefined' ? window.location.origin : 'https://gramodaya.org'}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* ── BACKDROP ── */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={handleResetForm}
      />

      {/* ── MODERN SHADCN CONTAINER ── */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 shadow-2xl z-10 my-8 overflow-hidden transition-all text-slate-900 dark:text-slate-50 animate-in zoom-in-95 duration-200">
        {/* Header & Step Indicator */}
        <JoinModalHeader currentStep={currentStep} onClose={handleResetForm} />

        {/* Dialog Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Error Banner */}
          {error && currentStep !== 4 && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Authentication (OTP / Password / OAuth) */}
          {currentStep === 1 && (
            <JoinStepAuth
              authMethod={authMethod}
              setAuthMethod={setAuthMethod}
              mobile={mobile}
              setMobile={setMobile}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              isOtpSent={isOtpSent}
              setIsOtpSent={setIsOtpSent}
              isSendingOtp={isSendingOtp}
              isVerifyingOtp={isVerifyingOtp}
              resendTimer={resendTimer}
              isMobileValid={isMobileValid}
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleVerifyOtp}
              emailOrMobile={emailOrMobile}
              setEmailOrMobile={setEmailOrMobile}
              password={password}
              setPassword={setPassword}
              onVerifyPasswordAccount={handleVerifyPasswordAccount}
              onOAuthSuccess={handleOAuthSuccess}
            />
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <JoinStepPersonal
              name={name}
              setName={setName}
              cleanMobileDigits={cleanMobileDigits}
              fatherName={fatherName}
              setFatherName={setFatherName}
              dob={dob}
              setDob={setDob}
              selectedVillageId={selectedVillageId}
              setSelectedVillageId={setSelectedVillageId}
              address={address}
              setAddress={setAddress}
              photoUrl={photoUrl}
              setPhotoUrl={setPhotoUrl}
              selectedVillageObj={selectedVillageObj}
              onPhotoSelect={handlePhotoSelect}
              onBack={() => setCurrentStep(1)}
              onNext={handleNextFromStep2}
            />
          )}

          {/* Step 3: Optional Background & Pledge */}
          {currentStep === 3 && (
            <JoinStepBackground
              occupation={occupation}
              setOccupation={setOccupation}
              designation={designation}
              setDesignation={setDesignation}
              politicalBackground={politicalBackground}
              setPoliticalBackground={setPoliticalBackground}
              bloodGroup={bloodGroup}
              setBloodGroup={setBloodGroup}
              pledgeAccepted={pledgeAccepted}
              setPledgeAccepted={setPledgeAccepted}
              isSubmitting={isSubmitting}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleSubmitFinal}
            />
          )}

          {/* Step 4: Success & Confirmation */}
          {currentStep === 4 && (
            <JoinStepSuccess
              registeredMember={registeredMember}
              alreadyRegistered={alreadyRegistered}
              selectedVillageObj={selectedVillageObj}
              occupation={occupation}
              onOpenDigitalCard={handleOpenMyDigitalCard}
              onShareWhatsApp={handleShareWhatsApp}
              onClose={handleResetForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};
