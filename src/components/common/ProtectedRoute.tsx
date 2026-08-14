'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Shield, UserCheck, KeyRound, MessageSquare } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN';
  sectionTitle?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'MEMBER',
  sectionTitle = 'गोपनीय अनुभाग (Private Section)',
}) => {
  const {
    authSession,
    currentMemberMobile,
    members,
    setIsAdminLoginModalOpen,
    setIsMemberLoginModalOpen,
    lang,
    t,
  } = useApp();

  const isSuperAdmin = Boolean(
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678'
  );
  const isAdminAuth = Boolean(authSession.isAdminLoggedIn || authSession.role === 'ADMIN' || isSuperAdmin);

  // Check if member is authenticated (or is an admin/super admin, or has valid session token)
  const isMemberAuth = Boolean(
    authSession.isMemberLoggedIn ||
    isAdminAuth ||
    authSession.token ||
    authSession.currentMember ||
    currentMemberMobile
  );

  // 0. SUPER ADMIN ONLY PROTECTION
  if (requiredRole === 'SUPER_ADMIN' && !isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <div className="bg-[#121216] text-white rounded-3xl border border-[#27272a] p-6 sm:p-8 shadow-2xl text-center space-y-4 relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-purple-950/70 border border-purple-800 text-purple-400 flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-black uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Super Admin Access Only</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {lang === 'en' ? '🔐 Super Admin Access Required' : '🔐 मुख्य प्रशासक अधिकार आवश्यक (Super Admin Only)'}
            </h2>
            <p className="text-xs text-zinc-400 font-semibold mt-1">
              {lang === 'en'
                ? `"${sectionTitle}" is strictly restricted to Global Super Administrators.`
                : `"${sectionTitle}" केवल मुख्य प्रशासक (Super Admin) के लिए सुरक्षित है।`}
            </p>
          </div>

          <div className="p-4 bg-[#18181c] border border-[#27272a] rounded-2xl text-xs text-zinc-300 text-left space-y-1.5 font-medium">
            <p className="font-bold flex items-center gap-1.5 text-purple-400">
              <Lock className="w-4 h-4" />
              <span>सुरक्षा नीति (Security Policy):</span>
            </p>
            <p className="text-zinc-400">• यह प्रशासनिक डैशबोर्ड केवल ग्लोबल सुपर एडमिन द्वारा एक्सेस किया जा सकता है।</p>
            <p className="text-zinc-400">• यदि आप मुख्य प्रशासक हैं, तो अधिकृत सुपर एडमिन क्रेडेंशियल्स के साथ लॉगिन करें।</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4 text-black" />
              <span>🔐 सुपर एडमिन लॉगिन (Super Admin Login)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. ADMIN ONLY PROTECTION
  if (requiredRole === 'ADMIN' && !isAdminAuth) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#D97706]/40 dark:border-amber-600/40 p-6 sm:p-8 shadow-xl text-center space-y-4 relative overflow-hidden transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#FDE68A] dark:border-amber-800 text-[#B45309] dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#2C3327] dark:text-white">
              {lang === 'en' ? '🔐 Admin Access Required' : '🔐 एडमिन अधिकार आवश्यक (Admin Access Only)'}
            </h2>
            <p className="text-xs text-[#8C8675] dark:text-slate-400 font-semibold mt-1">
              {lang === 'en'
                ? `"${sectionTitle}" is restricted to authorized Gram Panchayat administrators.`
                : `"${sectionTitle}" केवल अधिकृत ग्राम पंचायत एडमिन संरक्षकों के लिए उपलब्ध है।`}
            </p>
          </div>

          <div className="p-4 bg-[#F7F5F0] dark:bg-[#0B0F17] border border-[#E0DCCF] dark:border-slate-800 rounded-2xl text-xs text-[#2C3327] dark:text-slate-300 text-left space-y-1.5 font-medium">
            <p className="font-bold flex items-center gap-1.5 text-[#B45309] dark:text-amber-400">
              <Lock className="w-4 h-4" />
              <span>{lang === 'en' ? 'Security Policy:' : 'सुरक्षा एवं गोपनीयता निर्देश (Security Policy):'}</span>
            </p>
            <p>• {lang === 'en' ? 'General members or guests cannot access admin controls.' : 'सामान्य सदस्य या सार्वजनिक उपयोगकर्ता एडमिन पैनल एक्सेस नहीं कर सकते।'}</p>
            <p>• {lang === 'en' ? 'If you are an authorized admin, please login with your password or OTP.' : 'यदि आप अधिकृत एडमिन हैं, तो अपना पासवर्ड अथवा OTP दर्ज करके लॉगिन करें।'}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-[#D97706] hover:bg-[#B45309] dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>{lang === 'en' ? '🔐 Admin Login' : '🔐 एडमिन लॉगिन करें (Admin Login)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MEMBER / AUTHENTICATED USER PROTECTION (e.g. Live Chat)
  if (requiredRole === 'MEMBER' && !isMemberAuth && !isAdminAuth) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-emerald-600/30 dark:border-emerald-500/30 p-6 sm:p-8 shadow-xl text-center space-y-5 relative overflow-hidden transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
            <MessageSquare className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-300 dark:border-emerald-800">
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'UNAUTHORIZED ACCESS' : 'अनधिकृत पहुंच निषेध'}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#2C3327] dark:text-white">
              {lang === 'en' ? 'Member Login Required' : 'सदस्य लॉगिन अनिवार्य (Member Login Required)'}
            </h2>
            <p className="text-xs text-[#8C8675] dark:text-slate-400 font-medium mt-1">
              {lang === 'en'
                ? `Live chat & discussion forum is exclusively available for verified village members.`
                : `"${sectionTitle}" एवं लाइव संवाद केवल ग्राम पंचायत के स्वीकृत एवं सत्यापित सदस्यों के लिए है।`}
            </p>
          </div>

          <div className="p-4 bg-[#F7F5F0] dark:bg-[#0B0F17] border border-[#E0DCCF] dark:border-slate-800 rounded-2xl text-xs text-[#2C3327] dark:text-slate-300 text-left space-y-2 font-medium">
            <p className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>{lang === 'en' ? 'Why is authentication required?' : 'पहचान सत्यापन क्यों अनिवार्य है?'}</span>
            </p>
            <p className="text-xs">
              • {lang === 'en'
                ? 'To ensure clean, constructive village progress discussions free from spam or impersonation.'
                : 'ग्राम विकास एवं सामाजिक चर्चा को स्वच्छ, सुरक्षित एवं स्पैम-मुक्त रखने हेतु।'}
            </p>
            <p className="text-xs">
              • {lang === 'en'
                ? 'Only registered active members with valid mobile numbers can read and send messages.'
                : 'केवल पंजीकृत मोबाइल नंबर वाले सत्यापित सदस्य ही संदेश देख और भेज सकते हैं।'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>{lang === 'en' ? '🔐 Login to Access' : '🔐 लॉगिन करें (Login to Access)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
