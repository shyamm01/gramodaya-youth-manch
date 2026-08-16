'use client';

import React, { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import {
  JoinModalHeader,
  JoinStepCredentials,
  JoinStepPersonal,
  JoinStepSuccess,
} from './join';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  const {
    addMember,
    villageSettings,
    villages,
    setSelectedIdCardMember,
    t,
    lang,
  } = useApp();
  const isEn = lang === 'en';

  // Wizard Step: 1 = Registration (Credentials), 2 = Fill Basic Details, 3 = Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Registration State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Basic Details State (Includes Mobile Number)
  const [mobile, setMobile] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [photoUrl, setPhotoUrl] = useState('');
  const [pincode, setPincode] = useState('241125');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Hardoi');
  const [selectedPanchayat, setSelectedPanchayat] = useState('Bahera');
  const [selectedVillage, setSelectedVillage] = useState('Rasoolpur');
  const [occupation, setOccupation] = useState('');
  const [pledgeAccepted, setPledgeAccepted] = useState(true);

  // Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Clean Mobile Digits
  const cleanMobileDigits = mobile.replace(/\D/g, '').slice(-10);
  const isMobileValid = cleanMobileDigits.length === 10;

  // Selected Village Information
  const selectedVillageObj = useMemo(() => {
    return (
      (villages || []).find((v) => v.name === selectedVillage) ||
      villages[0] || {
        nameHindi: 'रसूलपुर',
        name: 'Rasoolpur',
        gramPanchayatName: 'Bahera',
        gramPanchayatNameHindi: 'बहेरा',
        districtName: 'Hardoi',
        districtNameHindi: 'हरदोई',
      }
    );
  }, [villages, selectedVillage]);

  // Step 1 Next Handler (Validate Registration Credentials)
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isEn ? 'Please enter member full name.' : 'कृपया सदस्य का पूरा नाम दर्ज करें।');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(
        isEn
          ? 'Please enter a valid email address.'
          : 'कृपया एक मान्य ईमेल पता दर्ज करें।'
      );
      return;
    }
    if (password.length < 8) {
      setError(
        isEn
          ? 'Password must be at least 8 characters.'
          : 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।'
      );
      return;
    }
    if (password !== confirmPassword) {
      setError(
        isEn
          ? 'Password and Confirm Password do not match.'
          : 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खा रहे हैं।'
      );
      return;
    }

    setError('');
    setCurrentStep(2);
  };

  // Step 2 Submit Handler (Submit Basic Details)
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMobileValid) {
      setError(
        isEn
          ? 'Please enter a valid 10-digit mobile number.'
          : 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।'
      );
      return;
    }
    if (!fatherName.trim()) {
      setError(isEn ? "Please enter father's/guardian's name." : 'कृपया पिता या अभिभावक का नाम दर्ज करें।');
      return;
    }
    if (!pledgeAccepted) {
      setError(isEn ? 'Please accept the membership pledge.' : 'कृपया सदस्यता संकल्प पत्र स्वीकार करें।');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setAlreadyRegistered(false);

    const formattedMobile = `+91 ${cleanMobileDigits.slice(0, 5)} ${cleanMobileDigits.slice(5)}`;
    const fullAddress = `${selectedVillage || 'Rasoolpur'}, ग्राम पंचायत ${selectedPanchayat || 'Bahera'}, जिला ${selectedDistrict || 'Hardoi'}`;

    const res = await addMember({
      name: name.trim(),
      mobile: formattedMobile,
      email: email.trim(),
      password,
      photoUrl,
      fatherName: fatherName.trim(),
      dob: dob.trim(),
      gender: gender.trim(),
      address: fullAddress,
      villageId: '1',
      occupation: occupation.trim(),
      organizationName: villageSettings.orgNameHindi || 'ग्रामोदय यूथ मंच',
      joiningDate: new Date().toISOString().split('T')[0],
    });

    setIsSubmitting(false);

    if (res.success && res.member) {
      setRegisteredMember(res.member);
      setCurrentStep(3);
    } else if (res.alreadyRegistered && res.member) {
      setRegisteredMember(res.member);
      setAlreadyRegistered(true);
      setError(
        res.error ||
          (isEn
            ? 'This mobile number is already registered.'
            : 'यह मोबाइल नंबर पहले से पंजीकृत है।')
      );
      setCurrentStep(3);
    } else {
      setError(
        res.error ||
          (isEn
            ? 'Error during registration. Please try again.'
            : 'पंजीकरण करने में त्रुटि हुई। कृपया पुनः प्रयास करें।')
      );
    }
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMobile('');
    setFatherName('');
    setDob('');
    setGender('Male');
    setPhotoUrl('');
    setPincode('241125');
    setSelectedState('Uttar Pradesh');
    setSelectedDistrict('Hardoi');
    setSelectedPanchayat('Bahera');
    setSelectedVillage('Rasoolpur');
    setOccupation('');
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
        `📍 *${t('join.villageUnit')}* ${selectedVillage}\n` +
        `📞 *${t('join.registeredMobile')}* ${registeredMember.mobile}\n` +
        (occupation ? `💼 *पेशा/व्यवसाय:* ${occupation}\n` : '') +
        `✅ ${isEn ? 'I have submitted my membership request for Gramodaya Youth Manch!' : 'मैंने ग्रामोदय यूथ मंच की सदस्यता के लिए आवेदन किया है। आप भी जुड़ें!'}\n\n` +
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

      {/* ── MODERN CONTAINER ── */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-10 my-8 overflow-hidden transition-all text-stone-900 dark:text-white animate-in zoom-in-95 duration-200">
        {/* Header & 2-Step Indicator */}
        <JoinModalHeader currentStep={currentStep} onClose={handleResetForm} />

        {/* Dialog Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Error Banner */}
          {error && currentStep !== 3 && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Phase 1: Registration (Name + Email + Password) */}
          {currentStep === 1 && (
            <JoinStepCredentials
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              onNext={handleNextFromStep1}
            />
          )}

          {/* Phase 2: Fill Basic Details (Mobile Number + Father's Name + Gender + DatePicker for DOB + Top-to-Down Village Selector + Photo + Pledge) */}
          {currentStep === 2 && (
            <JoinStepPersonal
              mobile={mobile}
              setMobile={setMobile}
              fatherName={fatherName}
              setFatherName={setFatherName}
              dob={dob}
              setDob={setDob}
              gender={gender}
              setGender={setGender}
              pincode={pincode}
              setPincode={setPincode}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedPanchayat={selectedPanchayat}
              setSelectedPanchayat={setSelectedPanchayat}
              selectedVillage={selectedVillage}
              setSelectedVillage={setSelectedVillage}
              occupation={occupation}
              setOccupation={setOccupation}
              photoUrl={photoUrl}
              setPhotoUrl={setPhotoUrl}
              pledgeAccepted={pledgeAccepted}
              setPledgeAccepted={setPledgeAccepted}
              isSubmitting={isSubmitting}
              onBack={() => setCurrentStep(1)}
              onSubmit={handleSubmitFinal}
            />
          )}

          {/* Phase 3: Completion & Success */}
          {currentStep === 3 && (
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
