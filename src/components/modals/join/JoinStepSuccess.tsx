'use client';

import React from 'react';
import { CheckCircle2, CreditCard, Share2, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui';
import { Member } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface JoinStepSuccessProps {
  registeredMember: Member | null;
  alreadyRegistered: boolean;
  selectedVillageObj: any;
  occupation: string;
  onOpenDigitalCard: () => void;
  onShareWhatsApp: () => void;
  onClose: () => void;
}

export const JoinStepSuccess: React.FC<JoinStepSuccessProps> = ({
  registeredMember,
  alreadyRegistered,
  selectedVillageObj,
  occupation,
  onOpenDigitalCard,
  onShareWhatsApp,
  onClose,
}) => {
  const { t, lang } = useApp();
  const isPending = registeredMember?.status === 'pending';

  return (
    <div className="py-3 text-center space-y-4 animate-in fade-in duration-200">
      {/* Success / Pending Badge */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ring-8 ${
          isPending
            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 ring-amber-50 dark:ring-amber-950/30'
            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 ring-emerald-50 dark:ring-emerald-950/30'
        }`}
      >
        {isPending ? <Clock className="w-6 h-6 animate-pulse" /> : <CheckCircle2 className="w-6 h-6" />}
      </div>

      {/* Header Text */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {alreadyRegistered
            ? lang === 'en'
              ? `Welcome, ${registeredMember?.name}!`
              : `स्वागत है, ${registeredMember?.name}!`
            : isPending
            ? lang === 'en'
              ? 'Registration Submitted (Pending Approval)'
              : 'पंजीकरण प्राप्त (एडमिन स्वीकृति लंबित)'
            : lang === 'en'
            ? 'Registration Successful!'
            : 'आवेदन सफलतापूर्वक दर्ज हुआ!'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {alreadyRegistered
            ? lang === 'en'
              ? 'You are already registered with Gramodaya Youth Manch.'
              : 'आप पहले से ग्रामोदय यूथ मंच परिवार के पंजीकृत सदस्य हैं।'
            : isPending
            ? lang === 'en'
              ? 'Your membership request has been submitted to the organization. An Admin or Super Admin will review and provide final approval.'
              : 'आपका पंजीकरण संगठन में जमा हो गया है। सदस्यता पूर्ण होने के लिए एडमिन या सुपर-एडमिन द्वारा अंतिम स्वीकृति की जाएगी।'
            : lang === 'en'
            ? 'Your member record is created. Your Digital Identity Card is ready to view.'
            : 'आपकी सदस्यता दर्ज हो गई है। आपका डिजिटल सदस्य पहचान पत्र तैयार है।'}
        </p>
      </div>

      {/* Receipt Card */}
      {registeredMember && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-left space-y-2 text-xs">
          <div className="flex justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">{t('join.applicantName')}</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {registeredMember.name}
            </span>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">{t('join.registeredMobile')}</span>
            <span className="font-mono font-medium text-slate-900 dark:text-white">
              {registeredMember.mobile}
            </span>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">{t('join.villageUnit')}</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {lang === 'en' ? selectedVillageObj.name : selectedVillageObj.nameHindi}
            </span>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Membership Status:' : 'सदस्यता स्थिति:'}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                isPending ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isPending ? <Clock className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              {isPending
                ? lang === 'en'
                  ? 'Pending Approval'
                  : 'सत्यापन लंबित'
                : lang === 'en'
                ? 'Active'
                : 'सक्रिय'}
            </span>
          </div>
          {(occupation || registeredMember.occupation) && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {lang === 'en' ? 'Occupation:' : 'पेशा/व्यवसाय:'}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {occupation || registeredMember.occupation}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
        <Button
          type="button"
          onClick={onOpenDigitalCard}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
          <span>{t('join.viewDigitalCard')}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onShareWhatsApp}
          className="w-full sm:w-auto text-xs font-medium rounded-xl text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          <span>WhatsApp</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="w-full sm:w-auto text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
        >
          {t('join.close')}
        </Button>
      </div>
    </div>
  );
};
