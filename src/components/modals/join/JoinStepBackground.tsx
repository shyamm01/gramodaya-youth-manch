'use client';

import React from 'react';
import {
  Briefcase,
  Award,
  Users,
  Droplet,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button, Input } from '../../ui';
import { useApp } from '../../../context/AppContext';
import { cn } from '@/src/lib/utils';

interface JoinStepBackgroundProps {
  occupation: string;
  setOccupation: (o: string) => void;
  designation: string;
  setDesignation: (d: string) => void;
  politicalBackground: string;
  setPoliticalBackground: (p: string) => void;
  bloodGroup: string;
  setBloodGroup: (b: string) => void;
  pledgeAccepted: boolean;
  setPledgeAccepted: (p: boolean) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const JoinStepBackground: React.FC<JoinStepBackgroundProps> = ({
  occupation,
  setOccupation,
  designation,
  setDesignation,
  politicalBackground,
  setPoliticalBackground,
  bloodGroup,
  setBloodGroup,
  pledgeAccepted,
  setPledgeAccepted,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  const { t, lang } = useApp();

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in duration-200">
      {/* Informational Banner */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {lang === 'en' ? 'Additional Information (Optional)' : 'अतिरिक्त जानकारी (वैकल्पिक)'}
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          {lang === 'en' ? 'Can be updated later' : 'बाद में भी जोड़ सकते हैं'}
        </span>
      </div>

      {/* Row 1: Occupation & Designation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'en' ? 'Occupation / Profession' : 'पेशा / व्यवसाय'}</span>
          </label>
          <Input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder={
              lang === 'en' ? 'e.g. Student, Farmer, Teacher' : 'उदा. छात्र, किसान, शिक्षक, व्यापार'
            }
            className="h-9.5 text-xs rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'en' ? 'Designation / Responsibility' : 'पद / दायित्व'}</span>
          </label>
          <Input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder={lang === 'en' ? 'e.g. Member / Volunteer' : 'उदा. सदस्य / युवा स्वयंसेवक'}
            className="h-9.5 text-xs rounded-lg"
          />
        </div>
      </div>

      {/* Row 2: Political Background & Blood Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'en' ? 'Political / Social Background' : 'राजनीतिक / सामाजिक पृष्ठभूमि'}</span>
          </label>
          <Input
            type="text"
            value={politicalBackground}
            onChange={(e) => setPoliticalBackground(e.target.value)}
            placeholder={
              lang === 'en' ? 'e.g. Social Worker / None' : 'उदा. सामाजिक कार्यकर्ता / कोई नहीं'
            }
            className="h-9.5 text-xs rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'en' ? 'Blood Group' : 'रक्त समूह (Blood Group)'}</span>
          </label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full h-9.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">{lang === 'en' ? 'Select Blood Group' : 'रक्त समूह चुनें'}</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      {/* Membership Pledge Checkbox */}
      <div
        onClick={() => setPledgeAccepted(!pledgeAccepted)}
        className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer select-none"
      >
        <div
          className={cn(
            'w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors',
            pledgeAccepted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950'
          )}
        >
          {pledgeAccepted && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
          {lang === 'en'
            ? 'I agree to the principles, community guidelines and rural development initiatives of Gramodaya Youth Manch.'
            : 'मैं ग्रामोदय यूथ मंच के नियमों एवं ग्राम विकास अभियानों के प्रति निष्ठावान रहने का संकल्प लेता हूँ।'}
        </p>
      </div>

      {/* Step 3 Action Buttons */}
      <div className="pt-2 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="text-xs h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>{lang === 'en' ? 'Back' : 'वापस'}</span>
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting || !pledgeAccepted}
          className="text-xs h-9 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {lang === 'en' ? 'Submitting...' : 'जमा हो रहा है...'}
            </span>
          ) : (
            <span>{t('join.submitBtn')}</span>
          )}
        </Button>
      </div>
    </form>
  );
};
