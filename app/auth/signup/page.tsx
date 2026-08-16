'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/src/context/ToastContext';
import { useApp } from '@/src/context/AppContext';
import { INDIAN_STATES, DEFAULT_PANCHAYATS } from '@/src/data/geoData';
import { DatePicker } from '@/src/components/ui/DatePicker';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Phone,
  Eye,
  EyeOff,
  Navigation,
  Loader2,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const inviteEmail = searchParams.get('inviteEmail') || '';
  const inviteName = searchParams.get('inviteName') || '';

  const { lang } = useApp();
  const isEn = lang === 'en';

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  // Wizard Step: 1 = Registration (Credentials), 2 = Fill Basic Details
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Account Registration State
  const [fullName, setFullName] = useState(inviteName);
  const [email, setEmail] = useState(inviteEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Basic Personal & Location Details State (Includes Mobile Number)
  const [mobile, setMobile] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [pincode, setPincode] = useState('241125');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Hardoi');
  const [selectedPanchayat, setSelectedPanchayat] = useState('Bahera');
  const [customPanchayat, setCustomPanchayat] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('Rasoolpur');
  const [customVillage, setCustomVillage] = useState('');
  const [dynamicPanchayats, setDynamicPanchayats] = useState<string[]>(['Bahera', 'Kachhauna', 'Sandila']);
  const [dynamicVillages, setDynamicVillages] = useState<string[]>(['Rasoolpur', 'Bahera Khas', 'Shivpur', 'Durgapur']);

  // Status State
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function checkCurrentSession() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace(next);
      }
    }
    checkCurrentSession();
  }, [router, next, supabase]);

  // Handle Pincode Auto-Lookup (Top-to-Down Trigger)
  const lookupPincode = useCallback(async (pin: string) => {
    if (pin.length !== 6) return;

    setPincodeLoading(true);
    try {
      const res = await fetch(`/api/pincode/${pin}`);
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.state) {
          const matchState = INDIAN_STATES.find(
            (s) => s.name.toLowerCase() === data.state.toLowerCase() || s.nameHindi === data.state
          );
          setSelectedState(matchState ? matchState.name : data.state);
        }
        if (data.district) {
          setSelectedDistrict(data.district);
        }

        // Populate Gram Panchayats / Post Offices from API
        if (Array.isArray(data.postOffices) && data.postOffices.length > 0) {
          const poNames: string[] = Array.from(
            new Set(data.postOffices.map((po: any) => po.name).filter(Boolean))
          );
          setDynamicPanchayats(poNames);
          if (poNames.length > 0) {
            setSelectedPanchayat(poNames[0]);
          }
        }
        toastSuccess(
          isEn ? `Pincode resolved: ${data.district}, ${data.state}` : `पिनकोड विवरण प्राप्त: ${data.district}, ${data.state}`,
          isEn ? 'Location Auto-Filled' : 'स्थान स्वतः भरा गया'
        );
      }
    } catch (err) {
      console.warn('Pincode lookup error:', err);
    } finally {
      setPincodeLoading(false);
    }
  }, [isEn, toastSuccess]);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      lookupPincode(val);
    }
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const stateObj = INDIAN_STATES.find((s) => s.name === stateName);
    if (stateObj && stateObj.districts.length > 0) {
      setSelectedDistrict(stateObj.districts[0].name);
    }
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    const matchPanchayats = DEFAULT_PANCHAYATS.filter(
      (p) => p.district.toLowerCase() === distName.toLowerCase()
    );
    if (matchPanchayats.length > 0) {
      const names = matchPanchayats.map((p) => p.name);
      setDynamicPanchayats(names);
      setSelectedPanchayat(names[0]);
      if (matchPanchayats[0].villages.length > 0) {
        setDynamicVillages(matchPanchayats[0].villages.map((v) => v.name));
        setSelectedVillage(matchPanchayats[0].villages[0].name);
      }
    }
  };

  const handlePanchayatChange = (panchayatName: string) => {
    setSelectedPanchayat(panchayatName);
    if (panchayatName === '__other__') return;

    const matchPanchayat = DEFAULT_PANCHAYATS.find(
      (p) => p.name.toLowerCase() === panchayatName.toLowerCase()
    );
    if (matchPanchayat && matchPanchayat.villages.length > 0) {
      const vNames = matchPanchayat.villages.map((v) => v.name);
      setDynamicVillages(vNames);
      setSelectedVillage(vNames[0]);
    }
  };

  const currentDistricts =
    INDIAN_STATES.find((s) => s.name === selectedState)?.districts || [
      { name: selectedDistrict, nameHindi: selectedDistrict },
    ];

  // Step 1: Validate Registration & Proceed to Step 2
  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      const msg = isEn ? 'Please enter your full name' : 'कृपया अपना पूरा नाम दर्ज करें';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Name Required' : 'नाम आवश्यक');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = isEn ? 'Please enter a valid email address' : 'कृपया एक वैध ईमेल पता दर्ज करें';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Invalid Email' : 'अमान्य ईमेल');
      return;
    }
    if (password.length < 8) {
      const msg = isEn ? 'Password must be at least 8 characters' : 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Weak Password' : 'कमजोर पासवर्ड');
      return;
    }
    if (password !== confirmPassword) {
      const msg = isEn ? 'Passwords do not match' : 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Password Mismatch' : 'पासवर्ड बेमेल');
      return;
    }

    setCurrentStep(2);
  };

  // Step 2: Submit Final Registration
  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanFatherName = fatherName.trim();
    const cleanPincode = pincode.replace(/\D/g, '').slice(0, 6);

    const resolvedPanchayat = selectedPanchayat === '__other__' ? customPanchayat.trim() : selectedPanchayat;
    const resolvedVillage = selectedVillage === '__other__' ? customVillage.trim() : selectedVillage;

    if (cleanMobile.length !== 10) {
      const msg = isEn ? 'Please enter a valid 10-digit mobile number' : 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Invalid Mobile' : 'अमान्य मोबाइल');
      return;
    }
    if (!cleanFatherName) {
      const msg = isEn ? "Please enter father's/guardian's name" : 'कृपया पिता या अभिभावक का नाम दर्ज करें';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Father Name Required' : 'पिता का नाम आवश्यक');
      return;
    }

    setLoading(true);

    try {
      // 1. Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            name: cleanName,
            mobile: cleanMobile,
            father_name: cleanFatherName,
            dob: dob.trim(),
            gender,
            state: selectedState,
            district: selectedDistrict,
            gram_panchayat: resolvedPanchayat,
            village: resolvedVillage,
            pincode: cleanPincode,
            status: 'pending',
            is_approved: false,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        let msg = error.message || (isEn ? 'Registration failed. Please try again.' : 'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।');
        if (error.message.toLowerCase().includes('already registered')) {
          msg = isEn ? 'This email is already registered. Please sign in or reset your password.' : 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें या पासवर्ड रीसेट करें।';
        }
        setErrorMessage(msg);
        toastError(msg, isEn ? 'Registration Error' : 'पंजीकरण त्रुटि');
        setLoading(false);
        return;
      }

      // Profile creation is automatically handled by the Supabase Auth Postgres trigger!
      // No manual fragile database insert needed.

      if (data?.user) {
        setIsSuccess(true);
        if (data.session) {
          const succ = isEn
            ? 'Account created! Your membership request has been submitted for Admin verification.'
            : 'खाता सफलतापूर्वक बन गया! आपकी सदस्यता का अनुरोध एडमिन सत्यापन के लिए भेज दिया गया है।';
          setSuccessInfo(succ);
          toastSuccess(succ, isEn ? 'Registration Submitted' : 'पंजीकरण प्राप्त');
          setTimeout(() => {
            router.refresh();
            router.replace(next);
          }, 2000);
        } else {
          const info = isEn
            ? `We sent a verification email to ${cleanEmail}. Once verified, your membership will be reviewed by the Admin team.`
            : `हमने ${cleanEmail} पर एक सत्यापन ईमेल भेजा है। ईमेल सत्यापित करने के बाद, एडमिन टीम द्वारा आपकी सदस्यता स्वीकृत की जाएगी।`;
          setSuccessInfo(info);
          toastSuccess(isEn ? 'Verification email sent.' : 'सत्यापन ईमेल भेजा गया।', isEn ? 'Verification Sent' : 'सत्यापन भेजा गया');
        }
      }
    } catch (err: any) {
      const msg = err?.message || (isEn ? 'An error occurred during registration.' : 'पंजीकरण के दौरान एक त्रुटि हुई।');
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Error' : 'त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMessage(null);
    setOauthLoading(true);
    toastInfo(isEn ? 'Redirecting to Google...' : 'गूगल प्रमाणीकरण पृष्ठ पर भेजा जा रहा है...', 'Google Signup');

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        const msg = error.message || (isEn ? 'Google authentication error.' : 'गूगल प्रमाणीकरण में त्रुटि।');
        setErrorMessage(msg);
        toastError(msg, 'OAuth');
        setOauthLoading(false);
      }
    } catch (err: any) {
      const msg = err?.message || (isEn ? 'Failed to initiate Google sign in.' : 'गूगल साइन इन प्रारंभ करने में विफल।');
      setErrorMessage(msg);
      toastError(msg, 'OAuth');
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-lg space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Compact Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-inner">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
            {isEn ? 'Create an Account' : 'नया खाता बनाएं'}
          </h1>
          <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
            {currentStep === 1
              ? isEn
                ? 'Step 1 of 2: Account & Login Credentials'
                : 'चरण १ / २: खाता एवं लॉगिन विवरण'
              : isEn
              ? 'Step 2 of 2: Basic Personal & Village Details'
              : 'चरण २ / २: मूल व्यक्तिगत व ग्राम विवरण'}
          </p>
        </div>

        {/* 2-Step Progress Indicator */}
        {!isSuccess && (
          <div className="grid grid-cols-2 gap-2 px-1">
            <div className="space-y-0.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= 1 ? 'bg-amber-600' : 'bg-stone-200 dark:bg-stone-800'
                }`}
              />
              <span className="text-[9px] font-bold uppercase tracking-wider block text-center text-stone-500">
                {isEn ? '1. Registration' : '१. पंजीकरण'}
              </span>
            </div>
            <div className="space-y-0.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= 2 ? 'bg-amber-600' : 'bg-stone-200 dark:bg-stone-800'
                }`}
              />
              <span className="text-[9px] font-bold uppercase tracking-wider block text-center text-stone-500">
                {isEn ? '2. Basic Details' : '२. मूल विवरण'}
              </span>
            </div>
          </div>
        )}

        {/* Card Box with Compact Padding */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {isSuccess ? (
            <div className="py-5 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                {isEn ? 'Registration Successful!' : 'पंजीकरण सफल!'}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-sm mx-auto">
                {successInfo}
              </p>
              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  <span>{isEn ? 'Go to Login' : 'लॉगिन पृष्ठ पर जाएं'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Special Invitation Banner */}
              {inviteEmail && (
                <div className="mb-3.5 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in">
                  <div className="p-1 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs block text-amber-800 dark:text-amber-300">
                      {isEn ? 'Membership Invitation' : 'विशेष सदस्यता निमंत्रण'}
                    </span>
                    <p className="leading-tight text-[11px]">
                      {isEn
                        ? `Welcome ${fullName || inviteName || 'friend'}! Please complete your details to join.`
                        : `स्वागत है ${fullName || inviteName || 'मित्र'}! सदस्यता पूर्ण करने हेतु विवरण भरें।`}
                    </p>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* PHASE 1: REGISTRATION (NAME, EMAIL, PASSWORD) */}
              {/* ================================================================ */}
              {currentStep === 1 && (
                <form onSubmit={handleNextToStep2} className="space-y-3">
                  {/* Row 1: Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Full Name' : 'पूरा नाम'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={isEn ? 'e.g. Ramesh Kumar' : 'उदा. रमेश कुमार'}
                          className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Email Address' : 'ईमेल पता'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Password' : 'पासवर्ड'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={isEn ? 'Create secure password' : 'सुरक्षित पासवर्ड बनाएं'}
                          className="w-full pl-9 pr-9 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {password.length > 0 && password.length < 8 && (
                        <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400 pl-1">
                          {isEn ? 'Min 8 characters' : 'कम से कम 8 अक्षर'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Confirm Password' : 'पासवर्ड पुष्टि'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={isEn ? 'Re-enter password' : 'पासवर्ड पुनः दर्ज करें'}
                          className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Step 1 Button */}
                  <div className="pt-1.5">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                      <span>{isEn ? 'Next: Fill Basic Details →' : 'आगे बढ़ें: मूल विवरण भरें →'}</span>
                    </button>
                  </div>

                  {/* Google OAuth Option */}
                  <div className="relative my-2.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-200 dark:border-stone-700/80"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white dark:bg-stone-900 px-2.5 text-stone-400">
                        {isEn ? 'Or continue with' : 'अथवा'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={oauthLoading}
                    className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-200 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isEn ? 'Sign up with Google' : 'गूगल के साथ साइन अप करें'}</span>
                  </button>
                </form>
              )}

              {/* ================================================================ */}
              {/* PHASE 2: FILL BASIC DETAILS (COMPACT 2-COLUMN LAYOUT) */}
              {/* ================================================================ */}
              {currentStep === 2 && (
                <form onSubmit={handleFinalSignup} className="space-y-3">
                  {/* Row 1: Mobile & Father's Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Mobile Number' : 'मोबाइल नंबर'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-500 select-none pointer-events-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-10 pr-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white font-mono placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? "Father's Name" : 'पिता का नाम'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="text"
                          required
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          placeholder={isEn ? 'e.g. Ram Charan' : 'उदा. राम चरन'}
                          className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Gender & Date of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Gender' : 'लिंग'}
                      </label>
                      <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-800/50 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700/80">
                        {(['Male', 'Female', 'Other'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`flex-1 py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              gender === g
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                            }`}
                          >
                            {g === 'Male'
                              ? isEn
                                ? 'Male'
                                : 'पुरुष'
                              : g === 'Female'
                              ? isEn
                                ? 'Female'
                                : 'महिला'
                              : isEn
                              ? 'Other'
                              : 'अन्य'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Date of Birth (DOB)' : 'जन्म तिथि (DOB)'}
                      </label>
                      <div className="relative">
                        <DatePicker
                          value={dob}
                          onChange={setDob}
                          placeholder={isEn ? 'Select DOB' : 'जन्म तिथि चुनें'}
                          lang={isEn ? 'en' : 'hi'}
                          minYear={1940}
                          maxYear={new Date().getFullYear()}
                          className="h-8.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700/80"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Pincode & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Pincode (Auto-lookup)' : 'पिनकोड (ऑटो-लुकअप)'}
                      </label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={handlePincodeChange}
                          placeholder="241125"
                          className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white font-mono placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                        />
                        {pincodeLoading && (
                          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-600 animate-spin" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'State' : 'राज्य'}
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st.code} value={st.name}>
                            {isEn ? st.name : st.nameHindi}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: District & Gram Panchayat */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'District' : 'जनपद / जिला'}
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        {currentDistricts.map((d) => (
                          <option key={d.name} value={d.name}>
                            {isEn ? d.name : d.nameHindi || d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        {isEn ? 'Gram Panchayat' : 'ग्राम पंचायत'}
                      </label>
                      <select
                        value={selectedPanchayat}
                        onChange={(e) => handlePanchayatChange(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        {dynamicPanchayats.map((gp) => (
                          <option key={gp} value={gp}>
                            {gp}
                          </option>
                        ))}
                        <option value="__other__">{isEn ? 'Other (Custom)' : 'अन्य'}</option>
                      </select>
                      {selectedPanchayat === '__other__' && (
                        <input
                          type="text"
                          required
                          value={customPanchayat}
                          onChange={(e) => setCustomPanchayat(e.target.value)}
                          placeholder={isEn ? 'Panchayat Name' : 'पंचायत नाम'}
                          className="w-full mt-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                        />
                      )}
                    </div>
                  </div>

                  {/* Row 5: Village Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      {isEn ? 'Village' : 'ग्राम / गांव'}
                    </label>
                    <select
                      value={selectedVillage}
                      onChange={(e) => setSelectedVillage(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      {dynamicVillages.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                      <option value="__other__">{isEn ? 'Other (Custom)' : 'अन्य'}</option>
                    </select>
                    {selectedVillage === '__other__' && (
                      <input
                        type="text"
                        required
                        value={customVillage}
                        onChange={(e) => setCustomVillage(e.target.value)}
                        placeholder={isEn ? 'Village Name' : 'गांव नाम'}
                        className="w-full mt-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  {/* Navigation Buttons for Step 2 */}
                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Back' : 'पीछे'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>{isEn ? 'Complete Registration' : 'पंजीकरण पूर्ण करें'}</span>
                          <Check className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800 text-center">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isEn ? 'Already have an account?' : 'क्या आपके पास पहले से खाता है?'}{' '}
              <Link
                href={`/auth/login?next=${encodeURIComponent(next)}`}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>{isEn ? 'Sign in' : 'लॉगिन करें'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
