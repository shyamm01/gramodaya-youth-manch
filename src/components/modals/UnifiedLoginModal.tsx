'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  Phone,
  KeyRound,
  ShieldCheck,
  UserCheck,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GymLogo } from '../common/GymLogo';

export const UnifiedLoginModal: React.FC = () => {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    isMemberLoginModalOpen,
    setIsMemberLoginModalOpen,
    adminLogin,
    memberLogin,
    sendMemberOtp,
    verifyMemberOtp,
    resetMemberPassword,
    resetAdminPassword,
    addMember,
    admins,
    members,
    villageSettings,
    lang,
    t,
  } = useApp();

  const isOpen = isAdminLoginModalOpen || isMemberLoginModalOpen;

  const handleClose = () => {
    setIsAdminLoginModalOpen(false);
    setIsMemberLoginModalOpen(false);
    resetForm();
  };

  // Tabs: 'otp' | 'password' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState<'otp' | 'password' | 'register' | 'forgot'>('otp');

  // Input states
  const [mobileOrEmail, setMobileOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Forgot password inputs
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regFather, setRegFather] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Loading & feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend Timer effect
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const resetForm = () => {
    setMobileOrEmail('');
    setPassword('');
    setShowPassword(false);
    setOtpCode('');
    setOtpSent(false);
    setResendTimer(0);
    setForgotNewPassword('');
    setForgotOtpCode('');
    setForgotOtpSent(false);
    setRegName('');
    setRegMobile('');
    setRegFather('');
    setRegAddress('');
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);
  };

  if (!isOpen) return null;

  // 1. Send OTP for Quick Login
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanInput = mobileOrEmail.trim();
    if (!cleanInput) {
      setErrorMsg(lang === 'en' ? 'Please enter mobile number or email.' : 'कृपया मोबाइल नंबर अथवा ईमेल दर्ज करें।');
      return;
    }

    setLoading(true);
    const res = await sendMemberOtp(cleanInput);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setResendTimer(30);
      setSuccessMsg(
        lang === 'en'
          ? 'Verification OTP sent successfully!'
          : 'सत्यापन OTP आपके मोबाइल नंबर/ईमेल पर भेज दिया गया है।'
      );
    } else {
      setErrorMsg(res.error || (lang === 'en' ? 'Failed to send OTP.' : 'OTP भेजने में विफल।'));
    }
  };

  // 2. Verify OTP for Quick Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMsg(lang === 'en' ? 'Please enter 6-digit OTP code.' : 'कृपया 6 अंकों का OTP कोड दर्ज करें।');
      return;
    }

    setLoading(true);

    const cleanInput = mobileOrEmail.trim();
    const digits = cleanInput.replace(/\D/g, '').slice(-10);
    const isAdmin = admins.some(
      (a) =>
        (a.mobile && a.mobile.replace(/\D/g, '').slice(-10) === digits) ||
        (a.email && a.email.toLowerCase() === cleanInput.toLowerCase())
    );

    if (isAdmin) {
      const adminRes = await adminLogin(cleanInput, otpCode.trim());
      setLoading(false);
      if (adminRes.success) {
        setSuccessMsg(lang === 'en' ? 'Admin authentication successful!' : 'एडमिन लॉगिन सफल!');
        setTimeout(handleClose, 800);
        return;
      }
    }

    const memberRes = await verifyMemberOtp(cleanInput, otpCode.trim());
    setLoading(false);

    if (memberRes.success) {
      setSuccessMsg(lang === 'en' ? 'Member authentication successful!' : 'सदस्य लॉगिन सफल!');
      setTimeout(handleClose, 800);
    } else {
      setErrorMsg(memberRes.error || (lang === 'en' ? 'Invalid OTP. Please check your messages.' : 'अमान्य OTP कोड। कृपया पुनः जांच कर दर्ज करें।'));
    }
  };

  // 3. Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanInput = mobileOrEmail.trim();
    if (!cleanInput || !password) {
      setErrorMsg(lang === 'en' ? 'Please enter mobile/email and password.' : 'कृपया मोबाइल/ईमेल और पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);

    const adminRes = await adminLogin(cleanInput, password);
    if (adminRes.success) {
      setLoading(false);
      setSuccessMsg(lang === 'en' ? 'Admin login successful!' : 'एडमिन लॉगिन सफल!');
      setTimeout(handleClose, 800);
      return;
    }

    const memberRes = await memberLogin(cleanInput, password);
    setLoading(false);

    if (memberRes.success) {
      setSuccessMsg(lang === 'en' ? 'Member login successful!' : 'सदस्य लॉगिन सफल!');
      setTimeout(handleClose, 800);
    } else {
      setErrorMsg(
        adminRes.error && !adminRes.error.includes('नहीं')
          ? adminRes.error
          : memberRes.error || (lang === 'en' ? 'Incorrect credentials.' : 'अमान्य मोबाइल नंबर या पासवर्ड।')
      );
    }
  };

  // 4. Send OTP for Password Reset
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanInput = mobileOrEmail.trim();
    if (!cleanInput) {
      setErrorMsg(lang === 'en' ? 'Please enter registered mobile number.' : 'कृपया पंजीकृत मोबाइल नंबर दर्ज करें।');
      return;
    }

    setLoading(true);
    const res = await sendMemberOtp(cleanInput);
    setLoading(false);

    if (res.success) {
      setForgotOtpSent(true);
      setResendTimer(30);
      setSuccessMsg(lang === 'en' ? 'Reset OTP sent to your registered mobile!' : 'पासवर्ड रीसेट OTP आपके मोबाइल पर भेजा गया है।');
    } else {
      setErrorMsg(res.error || (lang === 'en' ? 'Could not send reset OTP.' : 'OTP भेजने में विफल।'));
    }
  };

  // 5. Submit Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotOtpCode.trim() || !forgotNewPassword) {
      setErrorMsg(lang === 'en' ? 'Please enter OTP and new password.' : 'कृपया OTP और नया पासवर्ड दर्ज करें।');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setErrorMsg(lang === 'en' ? 'Password must be at least 6 characters long.' : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }

    setLoading(true);
    const cleanInput = mobileOrEmail.trim();
    const digits = cleanInput.replace(/\D/g, '').slice(-10);

    const isAdmin = admins.some(
      (a) =>
        (a.mobile && a.mobile.replace(/\D/g, '').slice(-10) === digits) ||
        (a.email && a.email.toLowerCase() === cleanInput.toLowerCase())
    );

    let res: { success: boolean; error?: string; message?: string };
    if (isAdmin) {
      res = await resetAdminPassword(cleanInput, forgotOtpCode.trim(), forgotNewPassword);
    } else {
      res = await resetMemberPassword(cleanInput, forgotOtpCode.trim(), forgotNewPassword);
    }
    setLoading(false);

    if (res.success) {
      setSuccessMsg(lang === 'en' ? 'Password reset successfully! You can now log in.' : 'पासवर्ड सफलतापूर्वक बदल गया है! अब लॉगिन करें।');
      setTimeout(() => {
        setActiveTab('password');
        setPassword(forgotNewPassword);
      }, 1500);
    } else {
      setErrorMsg(res.error || (lang === 'en' ? 'Password reset failed.' : 'पासवर्ड रीसेट विफल रहा।'));
    }
  };

  // 6. Direct Registration (Without number verification)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regMobile.trim()) {
      setErrorMsg(lang === 'en' ? 'Full name and mobile number are required.' : 'पूरा नाम और मोबाइल नंबर आवश्यक हैं।');
      return;
    }

    setLoading(true);
    const res = await addMember(
      regName.trim(),
      regMobile.trim(),
      '',
      new Date().toISOString(),
      villageSettings.orgNameHindi || 'ग्रामोदय यूथ मंच'
    );
    setLoading(false);

    if (res.success) {
      setSuccessMsg(
        lang === 'en'
          ? 'Registration submitted successfully! Your application has been sent for admin review.'
          : 'सदस्यता आवेदन सफलतापूर्वक दर्ज किया गया! आपका अनुरोध एडमिन समीक्षा हेतु भेज दिया गया है।'
      );
      setRegName('');
      setRegMobile('');
      setRegFather('');
      setRegAddress('');
      setTimeout(() => {
        handleClose();
      }, 2500);
    } else {
      setErrorMsg(res.error || (lang === 'en' ? 'Registration failed. Please try again.' : 'पंजीकरण विफल रहा। पुनः प्रयास करें।'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#111726] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#E0DCCF] dark:border-slate-800 relative text-[#2C3327] dark:text-slate-100 transition-colors">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#8C8675] hover:text-[#2C3327] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 border border-emerald-300 dark:border-emerald-800 shadow-xs">
            <GymLogo className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#2C3327] dark:text-white">
            {lang === 'en' ? 'Portal Authentication' : 'ग्रामोदय पोर्टल प्रवेश'}
          </h2>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-0.5 font-medium">
            {lang === 'en'
              ? `${villageSettings.orgName} — Single Portal Login`
              : `${villageSettings.orgNameHindi} — सदस्य एवं एडमिन सुरक्षा`}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#F0EDE4] dark:bg-[#0B0F17] rounded-2xl mb-4 border border-[#E0DCCF] dark:border-slate-800 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setActiveTab('otp');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition cursor-pointer text-center ${
              activeTab === 'otp'
                ? 'bg-white dark:bg-[#1E293B] text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-[#8C8675] dark:text-slate-400 hover:text-[#2C3327] dark:hover:text-white'
            }`}
          >
            ⚡ {lang === 'en' ? 'OTP Login' : 'OTP लॉगिन'}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition cursor-pointer text-center ${
              activeTab === 'password' || activeTab === 'forgot'
                ? 'bg-white dark:bg-[#1E293B] text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-[#8C8675] dark:text-slate-400 hover:text-[#2C3327] dark:hover:text-white'
            }`}
          >
            🔑 {lang === 'en' ? 'Password' : 'पासवर्ड'}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition cursor-pointer text-center ${
              activeTab === 'register'
                ? 'bg-white dark:bg-[#1E293B] text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-[#8C8675] dark:text-slate-400 hover:text-[#2C3327] dark:hover:text-white'
            }`}
          >
            📝 {lang === 'en' ? 'Register' : 'पंजीकरण'}
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold animate-fade-in">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: OTP LOGIN                                          */}
        {/* ========================================================= */}
        {activeTab === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    {lang === 'en' ? 'Mobile Number or Email *' : 'मोबाइल नंबर अथवा ईमेल *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C8675] dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder={lang === 'en' ? 'e.g. 9876543210 or admin@example.com' : 'उदा. 9876543210 या admin@example.com'}
                      value={mobileOrEmail}
                      onChange={(e) => setMobileOrEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !mobileOrEmail.trim()}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? (lang === 'en' ? 'Sending OTP...' : 'OTP भेजा जा रहा है...') : (lang === 'en' ? 'Send OTP' : 'OTP भेजें')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200">
                      {lang === 'en' ? 'Enter 6-Digit OTP *' : '6 अंकों का OTP दर्ज करें *'}
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      +91 {mobileOrEmail.replace(/\D/g, '').slice(-10)}
                    </span>
                  </div>

                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-center text-xl font-mono font-black tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-2xs"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold cursor-pointer"
                  >
                    ← {lang === 'en' ? 'Change Number' : 'नंबर बदलें'}
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleSendOtp}
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {resendTimer > 0
                      ? `${lang === 'en' ? 'Resend in' : 'पुनः भेजें'} ${resendTimer}s`
                      : (lang === 'en' ? 'Resend OTP' : 'पुनः OTP भेजें')}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.trim().length < 6}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? (lang === 'en' ? 'Verifying...' : 'सत्यापन हो रहा है...') : (lang === 'en' ? 'Verify & Login' : 'सत्यापित करके लॉगिन करें')}</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PASSWORD LOGIN                                     */}
        {/* ========================================================= */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {lang === 'en' ? 'Mobile Number or Email *' : 'मोबाइल नंबर अथवा ईमेल *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C8675] dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={lang === 'en' ? 'e.g. 9876543210 or admin@example.com' : 'उदा. 9876543210 या admin@example.com'}
                  value={mobileOrEmail}
                  onChange={(e) => setMobileOrEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200">
                  {lang === 'en' ? 'Password *' : 'पासवर्ड *'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {lang === 'en' ? 'Forgot Password?' : 'पासवर्ड भूल गए?'}
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C8675] dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#8C8675] hover:text-[#2C3327] dark:text-slate-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !mobileOrEmail.trim() || !password}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? (lang === 'en' ? 'Authenticating...' : 'लॉगिन हो रहा है...') : (lang === 'en' ? 'Login' : 'लॉगिन करें')}</span>
              <KeyRound className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 2.1: FORGOT PASSWORD FLOW                              */}
        {/* ========================================================= */}
        {activeTab === 'forgot' && (
          <div>
            {!forgotOtpSent ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    {lang === 'en' ? 'Enter Registered Mobile Number *' : 'पंजीकृत मोबाइल नंबर दर्ज करें *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 9876543210"
                    value={mobileOrEmail}
                    onChange={(e) => setMobileOrEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('password')}
                    className="px-3 py-2 bg-[#F0EDE4] dark:bg-slate-800 text-[#2C3327] dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-[#E4DFD3] transition cursor-pointer"
                  >
                    {lang === 'en' ? 'Cancel' : 'रद्द करें'}
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !mobileOrEmail.trim()}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <span>{loading ? (lang === 'en' ? 'Sending OTP...' : 'OTP भेजा जा रहा है...') : (lang === 'en' ? 'Send Reset OTP' : 'रीसेट OTP भेजें')}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    {lang === 'en' ? 'Enter 6-Digit OTP *' : '6 अंकों का OTP दर्ज करें *'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="••••••"
                    value={forgotOtpCode}
                    onChange={(e) => setForgotOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-center text-lg font-mono font-black focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    {lang === 'en' ? 'Set New Password (min 6 chars) *' : 'नया पासवर्ड सेट करें (कम से कम 6 अक्षर) *'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotOtpSent(false)}
                    className="px-3 py-2 bg-[#F0EDE4] dark:bg-slate-800 text-[#2C3327] dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-[#E4DFD3] transition cursor-pointer"
                  >
                    {lang === 'en' ? 'Back' : 'वापस'}
                  </button>

                  <button
                    type="submit"
                    disabled={loading || forgotOtpCode.length < 6 || forgotNewPassword.length < 6}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <span>{loading ? (lang === 'en' ? 'Saving...' : 'सहेज रहा है...') : (lang === 'en' ? 'Set New Password' : 'नया पासवर्ड सहेजें')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DIRECT REGISTRATION (No verification required)      */}
        {/* ========================================================= */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {lang === 'en' ? 'Full Name *' : 'पूरा नाम *'}
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder={lang === 'en' ? 'e.g. Shyam Pal' : 'उदा. श्याम पाल'}
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {lang === 'en' ? 'Mobile Number *' : 'मोबाइल नंबर *'}
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="उदा. 9876543210"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                  {lang === 'en' ? "Father's Name" : 'पिता/अभिभावक का नाम'}
                </label>
                <input
                  type="text"
                  placeholder="उदा. श्री..."
                  value={regFather}
                  onChange={(e) => setRegFather(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                  {lang === 'en' ? 'Village / Ward' : 'ग्राम / वार्ड'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'en' ? villageSettings.name : villageSettings.nameHindi}
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !regName.trim() || regMobile.trim().length < 10}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? (lang === 'en' ? 'Submitting...' : 'आवेदन भेजा जा रहा है...') : (lang === 'en' ? 'Submit Registration Directly' : 'सदस्यता पंजीकरण भेजें')}</span>
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Bottom Role Info */}
        <div className="mt-4 pt-3 border-t border-[#E0DCCF]/60 dark:border-slate-800 text-center text-[10px] text-[#8C8675] dark:text-slate-400 font-medium">
          🔒 {lang === 'en'
            ? 'Admins and verified members are automatically assigned their respective roles.'
            : 'लॉगिन के बाद सिस्टम स्वतः आपकी भूमिका (एडमिन अथवा सदस्य) पहचान कर अधिकार प्रदान करेगा।'}
        </div>
      </div>
    </div>
  );
};
