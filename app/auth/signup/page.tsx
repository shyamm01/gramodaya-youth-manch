'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/src/context/ToastContext';
import { useApp } from '@/src/context/AppContext';
import { INDIAN_STATES, DEFAULT_PANCHAYATS } from '@/src/data/geoData';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Check,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Building,
  Navigation,
  Loader2,
} from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const { lang } = useApp();
  const isEn = lang === 'en';

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  // Form State: Basic Personal Details
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  // Form State: Cascading Geographic Details
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

  // Form State: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
          // Find matching state name in INDIAN_STATES
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
      console.warn('Pincode auto lookup note:', err);
    } finally {
      setPincodeLoading(false);
    }
  }, [isEn, toastSuccess]);

  // When Pincode changes to 6 digits, auto trigger lookup
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      lookupPincode(val);
    }
  };

  // When State changes, update available districts
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const stateObj = INDIAN_STATES.find((s) => s.name === stateName);
    if (stateObj && stateObj.districts.length > 0) {
      setSelectedDistrict(stateObj.districts[0].name);
    }
  };

  // When District changes, update default panchayats & villages
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

  // When Panchayat changes, update available villages
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

  const finalPanchayat = selectedPanchayat === '__other__' ? customPanchayat.trim() : selectedPanchayat;
  const finalVillage = selectedVillage === '__other__' ? customVillage.trim() : selectedVillage;

  const currentDistricts =
    INDIAN_STATES.find((s) => s.name === selectedState)?.districts || [
      { name: selectedDistrict, nameHindi: selectedDistrict },
    ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanFatherName = fatherName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPincode = pincode.trim();
    const resolvedVillage = finalVillage || 'Rasoolpur';
    const resolvedPanchayat = finalPanchayat || 'Bahera';

    // Validations
    if (!cleanName) {
      const msg = isEn ? 'Please enter your full name' : 'कृपया अपना पूरा नाम दर्ज करें';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Name Required' : 'नाम आवश्यक है');
      return;
    }
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

      // 2. Register / sync in public.members PostgreSQL table as 'pending'
      try {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanName,
            mobile: cleanMobile,
            fatherName: cleanFatherName,
            gender,
            email: cleanEmail,
            state: selectedState,
            district: selectedDistrict,
            gramPanchayat: resolvedPanchayat,
            villageName: resolvedVillage,
            pincode: cleanPincode,
            address: `${resolvedVillage}, ग्राम पंचायत ${resolvedPanchayat}, जिला ${selectedDistrict}`,
            villageId: '1',
            status: 'pending',
            role: 'MEMBER',
            systemRole: 'MEMBER',
          }),
        });
      } catch (memErr) {
        console.warn('Member table sync note:', memErr);
      }

      if (data?.user) {
        setIsSuccess(true);
        if (data.session) {
          const succ = isEn
            ? 'Account created! Your membership request has been submitted for Admin / Super Admin verification.'
            : 'खाता सफलतापूर्वक बन गया! आपकी सदस्यता का अनुरोध एडमिन / सुपर-एडमिन सत्यापन और अंतिम स्वीकृति के लिए भेज दिया गया है।';
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
          toastSuccess(isEn ? 'Verification email sent. Please check your inbox.' : 'सत्यापन ईमेल भेजा गया। कृपया अपना इनबॉक्स जांचें।', isEn ? 'Verification Sent' : 'सत्यापन भेजा गया');
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
    toastInfo(isEn ? 'Redirecting to Google Authentication...' : 'गूगल प्रमाणीकरण पृष्ठ पर भेजा जा रहा है...', 'Google Signup');

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
        const msg = error.message || (isEn ? 'Google authentication error.' : 'गूगल ऑथेंटिकेशन में त्रुटि।');
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-inner mb-2">
            <UserPlus className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            {isEn ? 'Create an Account' : 'नया खाता बनाएं'}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
            {isEn
              ? 'Join Gramodaya Youth Manch portal to access village services and connect with the community'
              : 'ग्रामोदय यूथ मंच से जुड़कर ग्राम सेवाओं व सामुदायिक सुविधाओं का लाभ उठाएं'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Notifications */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                {isEn ? 'Registration Successful!' : 'पंजीकरण सफल!'}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {successInfo}
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                >
                  <span>{isEn ? 'Go to Login' : 'लॉगिन पृष्ठ पर जाएं'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-5">
                {/* ============================================================== */}
                {/* 1. Basic Personal Details Section */}
                {/* ============================================================== */}
                <div className="space-y-3.5">
                  <div className="pb-1 border-b border-stone-100 dark:border-stone-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {isEn ? '1. Basic Personal Details' : '1. मूल व्यक्तिगत विवरण'}
                    </h3>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                      {isEn ? 'Full Name' : 'पूरा नाम'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isEn ? 'e.g. Ramesh Kumar' : 'उदा. रमेश कुमार'}
                        className="w-full pl-11 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Mobile & Father Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        {isEn ? 'Mobile Number' : 'मोबाइल नंबर'}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-11 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        {isEn ? "Father's Name" : 'पिता का नाम'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                        <input
                          type="text"
                          required
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          placeholder={isEn ? 'e.g. Ram Charan' : 'उदा. राम चरन'}
                          className="w-full pl-11 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                      {isEn ? 'Gender' : 'लिंग'}
                    </label>
                    <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800/50 p-1 rounded-2xl border border-stone-200 dark:border-stone-700/80">
                      {(['Male', 'Female', 'Other'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            gender === g
                              ? 'bg-amber-600 text-white shadow-sm'
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
                </div>

                {/* ============================================================== */}
                {/* 2. Top-to-Down Village & Location Selectors (Auto-filled by Pincode) */}
                {/* ============================================================== */}
                <div className="space-y-3.5 pt-2">
                  <div className="pb-1 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {isEn ? '2. Village & Address Details (Top-to-Down)' : '2. ग्राम एवं पता विवरण (क्रमशः चयन)'}
                    </h3>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      {isEn ? 'Auto-filled via Pincode' : 'पिनकोड से स्वतः भरा जाएगा'}
                    </span>
                  </div>

                  {/* Pincode with Auto-lookup */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                      {isEn ? 'Pincode (Auto-fills State & District)' : 'पिनकोड (राज्य व जिला स्वतः भरेगा)'}
                    </label>
                    <div className="relative">
                      <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="241125"
                        className="w-full pl-11 pr-10 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm font-mono"
                      />
                      {pincodeLoading && (
                        <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* State & District Selectors Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* State Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        {isEn ? 'State' : 'राज्य'}
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st.code} value={st.name}>
                            {isEn ? st.name : st.nameHindi}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        {isEn ? 'District' : 'जनपद / जिला'}
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer"
                      >
                        {currentDistricts.map((d) => (
                          <option key={d.name} value={d.name}>
                            {isEn ? d.name : d.nameHindi || d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Gram Panchayat & Village Selectors Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Gram Panchayat Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        {isEn ? 'Gram Panchayat' : 'ग्राम पंचायत'}
                      </label>
                      <select
                        value={selectedPanchayat}
                        onChange={(e) => handlePanchayatChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer"
                      >
                        {dynamicPanchayats.map((gp) => (
                          <option key={gp} value={gp}>
                            {gp}
                          </option>
                        ))}
                        <option value="__other__">{isEn ? 'Other (Type Custom)' : 'अन्य (खुद लिखें)'}</option>
                      </select>
                      {selectedPanchayat === '__other__' && (
                        <input
                          type="text"
                          required
                          value={customPanchayat}
                          onChange={(e) => setCustomPanchayat(e.target.value)}
                          placeholder={isEn ? 'Enter Gram Panchayat name' : 'ग्राम पंचायत का नाम लिखें'}
                          className="w-full mt-2 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-amber-500/60 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Village / Gram Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        {isEn ? 'Village' : 'ग्राम / गांव'}
                      </label>
                      <select
                        value={selectedVillage}
                        onChange={(e) => setSelectedVillage(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer"
                      >
                        {dynamicVillages.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                        <option value="__other__">{isEn ? 'Other (Type Custom)' : 'अन्य (खुद लिखें)'}</option>
                      </select>
                      {selectedVillage === '__other__' && (
                        <input
                          type="text"
                          required
                          value={customVillage}
                          onChange={(e) => setCustomVillage(e.target.value)}
                          placeholder={isEn ? 'Enter Village name' : 'गांव का नाम लिखें'}
                          className="w-full mt-2 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-amber-500/60 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 3. Account Credentials Section */}
                {/* ============================================================== */}
                <div className="space-y-3.5 pt-2">
                  <div className="pb-1 border-b border-stone-100 dark:border-stone-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {isEn ? '3. Account Credentials' : '3. खाता सुरक्षा व लॉगिन विवरण'}
                    </h3>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                      {isEn ? 'Email Address' : 'ईमेल पता'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full pl-11 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        {isEn ? 'Password' : 'पासवर्ड'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-9 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {password.length > 0 && password.length < 8 && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 pl-1">
                          {isEn ? 'Minimum 8 characters' : 'कम से कम 8 अक्षर'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        {isEn ? 'Confirm Password' : 'पासवर्ड पुष्टि'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || oauthLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold shadow-lg shadow-amber-600/25 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isEn ? 'Complete Registration' : 'पंजीकरण पूरा करें'}</span>
                      <UserPlus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-6 items-center">
                <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
                <span className="flex-shrink mx-4 text-xs uppercase font-semibold text-stone-400 dark:text-stone-500 tracking-wider">
                  {isEn ? 'OR' : 'या'}
                </span>
                <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
              </div>

              {/* Google OAuth Signup */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={oauthLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500/70 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold rounded-2xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {oauthLoading ? (
                  <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                )}
                <span>{isEn ? 'Continue with Google' : 'गूगल के साथ जारी रखें'}</span>
              </button>
            </>
          )}

          {/* Footer link */}
          <div className="mt-8 text-center pt-6 border-t border-stone-100 dark:border-stone-800/80">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {isEn ? 'Already have an account?' : 'पहले से खाता है?'}{' '}
              <Link
                href={`/auth/login?next=${encodeURIComponent(next)}`}
                className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 inline-flex items-center gap-1 hover:underline ml-1"
              >
                {isEn ? 'Sign In' : 'साइन इन करें'}
                <ArrowRight className="w-3.5 h-3.5" />
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
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
