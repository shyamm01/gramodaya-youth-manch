'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PhoneCall, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import {
  Card,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../ui';
import { WhatsAppIcon } from '../common';

export const HelplineSection: React.FC = () => {
  const { admins: contextAdmins, villageSettings, t, lang } = useApp();
  const [fetchedAdmins, setFetchedAdmins] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const inFlightHelplinePromiseRef = React.useRef<Promise<any> | null>(null);

  // Dedicated API Fetch: GET /api/helpline (deduplicated)
  const fetchHelpline = React.useCallback(async () => {
    if (inFlightHelplinePromiseRef.current) {
      return inFlightHelplinePromiseRef.current;
    }
    const promise = (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/helpline', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.helplineContacts)) {
            setFetchedAdmins(data.helplineContacts);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch /api/helpline:', e);
      } finally {
        setLoading(false);
        inFlightHelplinePromiseRef.current = null;
      }
    })();
    inFlightHelplinePromiseRef.current = promise;
    return promise;
  }, []);

  React.useEffect(() => {
    fetchHelpline();
  }, [fetchHelpline]);

  const admins = fetchedAdmins || contextAdmins;

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F2EC] dark:bg-emerald-950/60 text-[#1E3A2F] dark:text-emerald-300 text-xs font-bold mb-3 border border-[#B3D6C2] dark:border-emerald-800">
          <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('helpline.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2C3327] dark:text-white tracking-tight">
          {t('nav.helpline')}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#8C8675] dark:text-slate-400 max-w-2xl mx-auto font-medium">
          {t('helpline.subtitle', {
            village: `${t('header.village')} ${lang === 'en' ? villageSettings.name : villageSettings.nameHindi}`,
            gp: `${t('header.gramPanchayat')} ${lang === 'en' ? villageSettings.gramPanchayat : villageSettings.gramPanchayatHindi}`,
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
        {admins.map((admin) => {
          const cleanDigits = admin.mobile.replace(/\D/g, '').slice(-10);
          const callUrl = `tel:+91${cleanDigits}`;
          const waUrl = `https://wa.me/91${cleanDigits}?text=${encodeURIComponent(
            lang === 'en' ? 'Hello! Contacting from Gramodaya Youth Manch Helpline:' : 'जय हिंद! ग्रामोदय यूथ मंच हेल्पलाइन संपर्क:'
          )}`;

          return (
            <Card
              key={admin.id}
              className="p-3.5 sm:p-5 flex flex-col items-center justify-between text-center relative overflow-hidden hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all rounded-2xl"
            >
              <Avatar size="lg" className="border-2 border-emerald-600 dark:border-emerald-500 mb-2 sm:mb-3">
                {admin.photoUrl ? (
                  <AvatarImage src={admin.photoUrl} alt={admin.name} />
                ) : null}
                <AvatarFallback>
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </AvatarFallback>
              </Avatar>

              <h3 className="text-xs sm:text-base font-bold text-[#2C3327] dark:text-white truncate max-w-full">{admin.name}</h3>
              <Badge variant="emerald" className="text-[9px] sm:text-[10px] mt-1 max-w-full truncate rounded-lg">
                {admin.role}
              </Badge>

              <p className="text-xs sm:text-sm font-mono font-bold text-[#2C3327] dark:text-slate-200 mt-2 sm:mt-3">{admin.mobile}</p>

              <div className="mt-3 sm:mt-4 w-full grid grid-cols-2 gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-[#E0DCCF] dark:border-slate-800">
                <a
                  href={callUrl}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 sm:px-3 bg-[#1E3A2F] hover:bg-[#142820] dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl text-[10px] sm:text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>{t('common.call')}</span>
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 sm:px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[10px] sm:text-xs font-bold transition shadow-2xs cursor-pointer"
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
