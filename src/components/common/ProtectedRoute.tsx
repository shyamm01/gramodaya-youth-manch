'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Shield,
  KeyRound,
  MessageSquare,
  AlertTriangle,
  Users,
  UserCheck,
  CreditCard,
  FileText,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { PermissionCode, SystemRole } from '../../types';
import { hasUserPermission, isSuperAdmin as checkIsSuperAdmin } from '../../lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: SystemRole;
  requiredPermission?: PermissionCode | string;
  targetVillageId?: string;
  sectionTitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  policyPoints?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'MEMBER',
  requiredPermission,
  targetVillageId,
  sectionTitle = 'गोपनीय अनुभाग (Private Section)',
  icon: CustomIcon,
  description: customDescription,
  policyPoints: customPolicyPoints,
}) => {
  const {
    authSession,
    currentMemberMobile,
    setIsAdminLoginModalOpen,
    setIsMemberLoginModalOpen,
    setIsJoinModalOpen,
    lang,
  } = useApp();

  const isSuperAdmin = Boolean(
    checkIsSuperAdmin(authSession) ||
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678'
  );

  const isAdminAuth = Boolean(
    isSuperAdmin ||
    authSession.isAdminLoggedIn ||
    authSession.role === 'ADMIN' ||
    authSession.systemRole === 'ADMIN'
  );

  // Check if member is authenticated (or is an admin/super admin, or has valid session token/supabase session)
  const isMemberAuth = Boolean(
    authSession.isMemberLoggedIn ||
    authSession.supabaseUserId ||
    isAdminAuth ||
    authSession.token ||
    authSession.currentMember ||
    currentMemberMobile
  );

  // Helper to determine context-relevant icon and policy details
  const getSectionMetadata = () => {
    const title = (sectionTitle || '').toLowerCase();

    if (title.includes('member') || title.includes('सदस्य') || title.includes('निर्देशिका') || title.includes('id card') || title.includes('पहचान')) {
      return {
        icon: Users,
        colorTheme: 'emerald',
        badge: lang === 'en' ? 'Verified Members Area' : 'सत्यापित सदस्य अनुभाग',
        heading: lang === 'en' ? 'Member Authentication Required' : 'सदस्य प्रमाणीकरण आवश्यक',
        subheading: lang === 'en'
          ? `Access to "${sectionTitle}" is restricted to active registered members of the Gramodaya Youth Manch.`
          : `"${sectionTitle}" केवल ग्रामोदय यूथ मंच के सक्रिय एवं पंजीकृत सदस्यों के लिए उपलब्ध है।`,
        policyTitle: lang === 'en' ? 'Why is authentication required for Member Directory?' : 'सदस्य निर्देशिका हेतु प्रमाणीकरण क्यों अनिवार्य है?',
        policies: [
          lang === 'en'
            ? 'Member privacy protection: Personal details and phone numbers are safeguarded from public crawlers.'
            : 'सदस्य गोपनीयता एवं संपर्क सुरक्षा: ग्राम पंचायत के पंजीकृत सदस्यों का विवरण सुरक्षित रखने हेतु।',
          lang === 'en'
            ? 'Digital ID verification: Official digital identity cards are issued only to verified community members.'
            : 'डिजिटल पहचान पत्र व पद सत्यापन: अधिकृत पदधारक एवं सदस्य ही डिजिटल पहचान पत्र देख व डाउनलोड कर सकते हैं।',
        ],
      };
    }

    if (title.includes('chat') || title.includes('चैट') || title.includes('संवाद')) {
      return {
        icon: MessageSquare,
        colorTheme: 'teal',
        badge: lang === 'en' ? 'Community Forum' : 'सामुदायिक संवाद कक्ष',
        heading: lang === 'en' ? 'Live Chat Login Required' : 'लाइव चैट लॉगिन अनिवार्य',
        subheading: lang === 'en'
          ? `Live discussion forum is exclusively available for verified village members.`
          : `"${sectionTitle}" एवं लाइव संवाद केवल ग्राम पंचायत के स्वीकृत एवं सत्यापित सदस्यों के लिए है।`,
        policyTitle: lang === 'en' ? 'Why is authentication required?' : 'पहचान सत्यापन क्यों अनिवार्य है?',
        policies: [
          lang === 'en'
            ? 'To ensure clean, constructive village progress discussions free from spam or impersonation.'
            : 'ग्राम विकास एवं सामाजिक चर्चा को स्वच्छ, सुरक्षित एवं स्पैम-मुक्त रखने हेतु।',
          lang === 'en'
            ? 'Only registered active members with valid credentials can read and post messages.'
            : 'केवल पंजीकृत मोबाइल नंबर अथवा ईमेल वाले सत्यापित सदस्य ही संदेश देख और भेज सकते हैं।',
        ],
      };
    }

    if (title.includes('problem') || title.includes('समस्या') || title.includes('शिकायत') || title.includes('grievance')) {
      return {
        icon: FileText,
        colorTheme: 'amber',
        badge: lang === 'en' ? 'Grievance Portal' : 'समस्या समाधान पोर्टल',
        heading: lang === 'en' ? 'Citizen Authentication' : 'नागरिक प्रमाणीकरण आवश्यक',
        subheading: lang === 'en'
          ? `Grievance tracking and problem reporting is safeguarded for verified residents.`
          : `"${sectionTitle}" में शिकायत दर्ज करने एवं स्थिति ट्रैक करने हेतु लॉगिन करें।`,
        policyTitle: lang === 'en' ? 'Grievance Redressal Policy:' : 'शिकायत निवारण सुरक्षा नीति:',
        policies: [
          lang === 'en'
            ? 'Authentic tracking: Receive status notifications and resolution updates on your registered account.'
            : 'पारदर्शी समाधान ट्रैकिंग: आपके खाते पर समाधान प्रगति एवं आधिकारिक जवाब सीधे प्राप्त होते हैं।',
          lang === 'en'
            ? 'Accountability: Prevents false or duplicate reports from anonymous sources.'
            : 'विश्वसनीयता एवं सुरक्षा: फर्जी या भ्रामक रिपोर्टिंग से बचाव हेतु सदस्य सत्यापन आवश्यक है।',
        ],
      };
    }

    // Default Member protection
    return {
      icon: ShieldCheck,
      colorTheme: 'emerald',
      badge: lang === 'en' ? 'Protected Area' : 'सुरक्षित अनुभाग',
      heading: lang === 'en' ? 'Member Login Required' : 'सदस्य लॉगिन अनिवार्य (Member Login Required)',
      subheading: lang === 'en'
        ? `"${sectionTitle}" is exclusively available for verified village members.`
        : `"${sectionTitle}" केवल ग्राम पंचायत के स्वीकृत एवं सत्यापित सदस्यों के लिए उपलब्ध है।`,
      policyTitle: lang === 'en' ? 'Why is authentication required?' : 'पहचान सत्यापन क्यों अनिवार्य है?',
      policies: [
        lang === 'en'
          ? 'To ensure safe, authentic community records and personalized services.'
          : 'सामुदायिक सेवाओं और सूचनाओं को सुरक्षित एवं प्रामाणिक बनाए रखने हेतु।',
        lang === 'en'
          ? 'Only registered members with verified credentials can access this section.'
          : 'केवल पंजीकृत सदस्य ही इस अनुभाग की सामग्री का उपयोग कर सकते हैं।',
      ],
    };
  };

  const meta = getSectionMetadata();
  const IconComponent = CustomIcon || meta.icon;
  const descriptionText = customDescription || meta.subheading;
  const policyList = customPolicyPoints || meta.policies;

  // 0. SUPER ADMIN ONLY PROTECTION
  if (requiredRole === 'SUPER_ADMIN' && !isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative overflow-hidden bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-950/20 text-center space-y-6">
          {/* Top Radial Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-600 dark:text-purple-400 shadow-xl shadow-purple-500/10">
            <Crown className="w-10 h-10" />
            <span className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 rounded-full border-2 border-white dark:border-stone-900 text-white">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Super Admin Access Only</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {lang === 'en' ? 'Super Admin Access Required' : 'मुख्य प्रशासक अधिकार आवश्यक'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-md mx-auto leading-relaxed">
              {lang === 'en'
                ? `"${sectionTitle}" is strictly restricted to Global Super Administrators.`
                : `"${sectionTitle}" केवल मुख्य प्रशासक (Super Admin) के लिए सुरक्षित है।`}
            </p>
          </div>

          {/* Security policy box */}
          <div className="p-5 bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs text-stone-700 dark:text-stone-300 text-left space-y-2 font-medium">
            <p className="font-bold flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <Shield className="w-4 h-4" />
              <span>सुरक्षा नीति (Security Policy):</span>
            </p>
            <p className="text-stone-600 dark:text-stone-400">• यह प्रशासनिक डैशबोर्ड केवल ग्लोबल सुपर एडमिन द्वारा एक्सेस किया जा सकता है।</p>
            <p className="text-stone-600 dark:text-stone-400">• अधिकृत सुपर एडमिन क्रेडेंशियल्स के साथ लॉगिन करें।</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>{lang === 'en' ? 'Super Admin Login' : 'सुपर एडमिन लॉगिन (Super Admin Login)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. ADMIN ONLY PROTECTION
  if (requiredRole === 'ADMIN' && !isAdminAuth) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative overflow-hidden bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-amber-950/20 text-center space-y-6">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xl shadow-amber-500/10">
            <Shield className="w-10 h-10" />
            <span className="absolute -bottom-1 -right-1 p-1.5 bg-amber-600 rounded-full border-2 border-white dark:border-stone-900 text-white">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Access Only</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {lang === 'en' ? 'Admin Access Required' : 'एडमिन अधिकार आवश्यक (Admin Access Only)'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-md mx-auto leading-relaxed">
              {lang === 'en'
                ? `"${sectionTitle}" is restricted to authorized Gram Panchayat administrators.`
                : `"${sectionTitle}" केवल अधिकृत ग्राम पंचायत एडमिन संरक्षकों के लिए उपलब्ध है।`}
            </p>
          </div>

          <div className="p-5 bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs text-stone-700 dark:text-stone-300 text-left space-y-2 font-medium">
            <p className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Lock className="w-4 h-4" />
              <span>{lang === 'en' ? 'Security Policy:' : 'सुरक्षा एवं गोपनीयता निर्देश (Security Policy):'}</span>
            </p>
            <p className="text-stone-600 dark:text-stone-400">• {lang === 'en' ? 'General members or guests cannot access admin controls.' : 'सामान्य सदस्य या सार्वजनिक उपयोगकर्ता एडमिन पैनल एक्सेस नहीं कर सकते।'}</p>
            <p className="text-stone-600 dark:text-stone-400">• {lang === 'en' ? 'If you are an authorized admin, please login with your registered credentials.' : 'यदि आप अधिकृत एडमिन हैं, तो अपने अधिकृत क्रेडेंशियल्स दर्ज करके लॉगिन करें।'}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>{lang === 'en' ? 'Admin Login' : 'एडमिन लॉगिन करें (Admin Login)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MEMBER / AUTHENTICATED USER PROTECTION (Dynamic Content & Cards)
  if (requiredRole === 'MEMBER' && !isMemberAuth) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative overflow-hidden bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-2xl border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-stone-900/10 dark:shadow-black/60 text-center space-y-6">
          {/* Top Radial Glow Accent */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Contextual Icon Orb */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-amber-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/10">
            <IconComponent className="w-10 h-10" />
            <span className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 rounded-full border-2 border-white dark:border-stone-900 text-white shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Header Title & Subtitle */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2.5 border border-emerald-200 dark:border-emerald-800/80">
              <Lock className="w-3.5 h-3.5" />
              <span>{meta.badge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {meta.heading}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-lg mx-auto leading-relaxed">
              {descriptionText}
            </p>
          </div>

          {/* Relevant Context-Aware Policy Card */}
          <div className="p-5 bg-stone-50/90 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 rounded-2xl text-xs text-stone-700 dark:text-stone-300 text-left space-y-2.5 font-medium shadow-inner">
            <p className="font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{meta.policyTitle}</span>
            </p>
            {policyList.map((policy, idx) => (
              <p key={idx} className="flex items-start gap-2 text-stone-600 dark:text-stone-300 pl-1 leading-relaxed">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{policy}</span>
              </p>
            ))}
          </div>

          {/* Modern Action Buttons Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Primary Sign In Action */}
              <Link
                href="/auth/login"
                className="w-full sm:w-auto flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'en' ? 'Sign In to Continue' : 'साइन इन करें (Sign In)'}</span>
              </Link>

              {/* Secondary Create Account Action */}
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto flex-1 px-6 py-3.5 border border-stone-300 dark:border-stone-700 hover:border-amber-500 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold rounded-2xl text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{lang === 'en' ? 'Create Free Account' : 'नया खाता बनाएं (Sign Up)'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. GRANULAR RBAC PERMISSION CHECK
  if (requiredPermission) {
    const hasPerm = hasUserPermission(authSession, requiredPermission, targetVillageId);
    if (!hasPerm) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative overflow-hidden bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-300 dark:border-amber-800">
                <Lock className="w-3.5 h-3.5" />
                <span>RBAC Permission Denied</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                {lang === 'en' ? 'Specific Permission Required' : 'विशिष्ट अनुमति आवश्यक'}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 font-mono">
                {requiredPermission}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              {lang === 'en'
                ? 'Your current role or account permissions do not grant access to perform this operation.'
                : 'आपकी वर्तमान भूमिका या खाते की अनुमतियों में यह कार्य करने का अधिकार शामिल नहीं है।'}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
