'use client';

import React from 'react';
import {
  User,
  Camera,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button, Input, Avatar, AvatarImage, AvatarFallback, DatePicker } from '../../ui';
import { AddressFormFields, AddressData } from '../../common/AddressFormFields';
import { useApp } from '../../../context/AppContext';

interface JoinStepPersonalProps {
  name: string;
  setName: (n: string) => void;
  cleanMobileDigits: string;
  fatherName: string;
  setFatherName: (f: string) => void;
  dob: string;
  setDob: (d: string) => void;
  gender: string;
  setGender: (g: string) => void;
  selectedVillageId: string;
  setSelectedVillageId: (v: string) => void;
  address: string;
  setAddress: (a: string) => void;
  photoUrl: string;
  setPhotoUrl: (p: string) => void;
  selectedVillageObj: any;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onNext: (e: React.FormEvent) => void;
}

export const JoinStepPersonal: React.FC<JoinStepPersonalProps> = ({
  name,
  setName,
  cleanMobileDigits,
  fatherName,
  setFatherName,
  dob,
  setDob,
  gender,
  setGender,
  selectedVillageId,
  setSelectedVillageId,
  address,
  setAddress,
  photoUrl,
  setPhotoUrl,
  selectedVillageObj,
  onPhotoSelect,
  onBack,
  onNext,
}) => {
  const { villages, t, lang } = useApp();

  return (
    <form onSubmit={onNext} className="space-y-4 animate-in fade-in duration-200">
      {/* ── PHOTO UPLOAD CARD ── */}
      <div className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative group">
          <Avatar className="w-14 h-14 border-2 border-slate-200 dark:border-slate-700 shadow-xs">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt="Avatar Preview" className="object-cover" />
            ) : (
              <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400">
                <User className="w-6 h-6" />
              </AvatarFallback>
            )}
          </Avatar>
          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhotoUrl('')}
              className="absolute -top-1 -right-1 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xs"
              title={t('join.changePhoto')}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {t('join.passportPhoto')}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {lang === 'en'
              ? 'JPG, PNG up to 5MB (ID Card Photo)'
              : 'JPG, PNG अधिकतम 5MB (ID कार्ड हेतु फ़ोटो)'}
          </p>
          <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 mt-1">
            <Camera className="w-3.5 h-3.5" />
            <span>{photoUrl ? t('join.changePhoto') : t('join.uploadPhoto')}</span>
            <input type="file" accept="image/*" onChange={onPhotoSelect} className="hidden" />
          </label>
        </div>
      </div>

      {/* ── ROW 1: FULL NAME & VERIFIED MOBILE ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('join.fullName')} <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={lang === 'en' ? 'e.g. Rahul Kumar' : 'उदा. राहुल कुमार'}
            className="h-9.5 text-xs rounded-lg"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>{t('join.mobile')}</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {lang === 'en' ? 'Verified' : 'सत्यापित'}
            </span>
          </label>
          <div className="relative">
            <Input
              type="text"
              disabled
              value={`+91 ${cleanMobileDigits.slice(0, 5)} ${cleanMobileDigits.slice(5)}`}
              className="h-9.5 text-xs font-mono bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* ── ROW 2: FATHER'S NAME & GENDER ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('join.fatherName')}
          </label>
          <Input
            type="text"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            placeholder={lang === 'en' ? 'e.g. Shyam Lal' : 'उदा. श्याम लाल'}
            className="h-9.5 text-xs rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            {lang === 'en' ? 'Gender' : 'लिंग (Gender)'}
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full h-9.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">{lang === 'en' ? 'Select Gender' : 'लिंग चुनें'}</option>
            <option value="male">{lang === 'en' ? 'Male (पुरुष)' : 'पुरुष (Male)'}</option>
            <option value="female">{lang === 'en' ? 'Female (महिला)' : 'महिला (Female)'}</option>
            <option value="other">{lang === 'en' ? 'Other (अन्य)' : 'अन्य (Other)'}</option>
          </select>
        </div>
      </div>

      {/* ── ROW 3: DOB ── */}
      <div className="space-y-1.5 relative z-30">
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          {t('join.dob')}
        </label>
        <DatePicker
          value={dob}
          onChange={setDob}
          placeholder={lang === 'en' ? 'Select Date of Birth' : 'जन्म तिथि चुनें'}
          lang={lang}
          minYear={1930}
          maxYear={new Date().getFullYear()}
          placement="top"
          className="h-9.5 text-xs rounded-lg"
        />
      </div>

      {/* ── ROW 4: COMPLETE STRUCTURED ADDRESS (WITH GRAM PANCHAYAT AUTO-FILL & PINCODE LOOKUP) ── */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>{lang === 'en' ? 'Gram Panchayat & Address Details' : 'ग्राम पंचायत एवं पता विवरण'}</span>
        </h4>
        <AddressFormFields
          value={{ fullAddress: address }}
          selectedVillageId={selectedVillageId}
          onVillageSelect={setSelectedVillageId}
          onChange={(addrData: AddressData) => {
            setAddress(addrData.fullAddress || '');
            if (addrData.villageId) setSelectedVillageId(addrData.villageId);
          }}
          lang={lang === 'en' ? 'en' : 'hi'}
        />
      </div>

      {/* ── ACTION BUTTONS ── */}
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
          className="text-xs h-9 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
        >
          <span>{lang === 'en' ? 'Next (Optional Details)' : 'आगे बढ़ें (वैकल्पिक विवरण)'}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>
    </form>
  );
};
