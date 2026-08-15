'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, MessageSquare, ShieldCheck, UserCheck, Camera } from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../ui';
import { WhatsAppIcon } from '../common';

export const LeadershipSection: React.FC = () => {
  const { admins: contextAdmins, villageSettings, authSession, uploadPhoto, setIsAdminLoginModalOpen, t, lang } = useApp();
  const [fetchedAdmins, setFetchedAdmins] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Dedicated API Fetch: GET /api/leadership
  const fetchLeadership = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leadership', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leaders)) {
          setFetchedAdmins(data.leaders);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch /api/leadership:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLeadership();
  }, [fetchLeadership]);

  const admins = fetchedAdmins || contextAdmins;

  const handlePhotoUpload = (adminId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          uploadPhoto('admin', adminId, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto transition-colors duration-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F2EC] dark:bg-emerald-950/60 text-[#1E3A2F] dark:text-emerald-300 text-xs font-bold mb-3 border border-[#B3D6C2] dark:border-emerald-800 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('leadership.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2C3327] dark:text-white tracking-tight">
          {t('nav.leadership')}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#8C8675] dark:text-slate-400 max-w-2xl mx-auto font-medium">
          {lang === 'en' ? villageSettings.orgName : villageSettings.orgNameHindi}, {t('header.village')} — <span className="font-bold text-emerald-700 dark:text-emerald-400">{lang === 'en' ? villageSettings.name : villageSettings.nameHindi}</span>, {t('header.gramPanchayat')} — <span className="font-bold text-emerald-700 dark:text-emerald-400">{lang === 'en' ? villageSettings.gramPanchayat : villageSettings.gramPanchayatHindi}</span>
        </p>

        {/* Admin Login Status Banner for Photo Upload */}
        {authSession.isAdminLoggedIn ? (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>{t('leadership.adminNotice')}</span>
          </div>
        ) : (
          <div className="mt-3">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t('leadership.adminLoginPrompt')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: 2 top on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {admins.map((admin, idx) => {
          const cleanDigits = admin.mobile.replace(/\D/g, '').slice(-10);
          const callUrl = `tel:+91${cleanDigits}`;
          const waUrl = `https://wa.me/91${cleanDigits}?text=${encodeURIComponent(
            lang === 'en' ? 'Hello! Contacting Gramodaya Youth Manch:' : 'जय हिंद! ग्रामोदय यूथ मंच रसूलपुर के संदर्भ में संदेश:'
          )}`;

          return (
            <Card
              key={admin.id}
              className="p-3 sm:p-5 flex flex-col items-center justify-between text-center relative group overflow-hidden hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all rounded-2xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600 dark:bg-emerald-500"></div>

              {/* Number Badge (1, 2, 3, 4) */}
              <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-[#E8F2EC] dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px] flex items-center justify-center border border-[#B3D6C2] dark:border-emerald-800">
                {idx + 1}
              </div>

              {/* Photo Container */}
              <div className="relative mb-2.5 mt-2 sm:mb-4 sm:mt-2">
                <Avatar size="xl" className="border-2 border-emerald-600 dark:border-emerald-500 shadow-xs">
                  {admin.photoUrl ? (
                    <AvatarImage src={admin.photoUrl} alt={admin.name} />
                  ) : null}
                  <AvatarFallback>
                    <UserCheck className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
                  </AvatarFallback>
                </Avatar>

                {/* Camera Upload Overlay */}
                {authSession.isAdminLoggedIn ? (
                  <label
                    className="absolute -bottom-1 -right-1 bg-amber-600 hover:bg-amber-700 text-white p-1.5 sm:px-2.5 sm:py-1 rounded-full cursor-pointer shadow-md transition-transform hover:scale-110 flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold"
                    title={t('members.changePhoto')}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('members.changePhotoBtn')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(admin.id, e)}
                    />
                  </label>
                ) : (
                  <button
                    onClick={() => setIsAdminLoginModalOpen(true)}
                    className="absolute -bottom-1 -right-1 bg-emerald-700 hover:bg-emerald-800 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-transform hover:scale-105 flex items-center"
                    title={t('members.changePhoto')}
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1 w-full">
                <h3 className="font-extrabold text-[#2C3327] dark:text-white text-xs sm:text-base leading-tight truncate">
                  {admin.name}
                </h3>
                <Badge variant="emerald" className="text-[10px] sm:text-xs font-bold py-0.5 rounded-lg max-w-full truncate">
                  {admin.role}
                </Badge>
                <p className="text-[11px] sm:text-xs font-mono font-bold text-[#8C8675] dark:text-slate-300 mt-1 truncate">
                  {admin.mobile}
                </p>
              </div>

              {/* Call & WhatsApp Actions */}
              <div className="mt-3 sm:mt-4 w-full grid grid-cols-2 gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-[#E0DCCF] dark:border-slate-800">
                <a
                  href={callUrl}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 bg-[#1E3A2F] hover:bg-[#142820] dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl text-[10px] sm:text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>{t('common.call')}</span>
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[10px] sm:text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>{t('common.whatsapp')}</span>
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
