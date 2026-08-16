'use client';

import React, { useCallback, useState } from 'react';
import {
  Briefcase,
  Navigation,
  ArrowLeft,
  Loader2,
  Check,
  MapPin,
} from 'lucide-react';
import { Input } from '../../ui';
import { useApp } from '../../../context/AppContext';
import { INDIAN_STATES, DEFAULT_PANCHAYATS } from '@/src/data/geoData';

interface JoinStepBackgroundProps {
  pincode: string;
  setPincode: (p: string) => void;
  selectedState: string;
  setSelectedState: (s: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  selectedPanchayat: string;
  setSelectedPanchayat: (gp: string) => void;
  selectedVillage: string;
  setSelectedVillage: (v: string) => void;
  occupation: string;
  setOccupation: (o: string) => void;
  pledgeAccepted: boolean;
  setPledgeAccepted: (p: boolean) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const JoinStepBackground: React.FC<JoinStepBackgroundProps> = ({
  pincode,
  setPincode,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  selectedPanchayat,
  setSelectedPanchayat,
  selectedVillage,
  setSelectedVillage,
  occupation,
  setOccupation,
  pledgeAccepted,
  setPledgeAccepted,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  const { lang } = useApp();
  const isEn = lang === 'en';

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [dynamicPanchayats, setDynamicPanchayats] = useState<string[]>(['Bahera', 'Kachhauna', 'Sandila']);
  const [dynamicVillages, setDynamicVillages] = useState<string[]>(['Rasoolpur', 'Bahera Khas', 'Shivpur', 'Durgapur']);
  const [customPanchayat, setCustomPanchayat] = useState('');
  const [customVillage, setCustomVillage] = useState('');

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
      }
    } catch (err) {
      console.warn('Pincode lookup error in modal:', err);
    } finally {
      setPincodeLoading(false);
    }
  }, [setSelectedState, setSelectedDistrict, setSelectedPanchayat]);

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

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in duration-200">
      {/* ── 1. PINCODE AUTO-LOOKUP ── */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
          {isEn ? 'Pincode (Auto-fills State & District)' : 'पिनकोड (राज्य व जिला स्वतः भरेगा)'}
        </label>
        <div className="relative">
          <Navigation className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <Input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={handlePincodeChange}
            placeholder="241125"
            className="pl-9 pr-9 h-10 text-xs font-mono rounded-xl"
          />
          {pincodeLoading && (
            <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      {/* ── 2. STATE & DISTRICT SELECTORS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
            {isEn ? 'State' : 'राज्य'}
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st.code} value={st.name}>
                {isEn ? st.name : st.nameHindi}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
            {isEn ? 'District' : 'जनपद / जिला'}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {currentDistricts.map((d) => (
              <option key={d.name} value={d.name}>
                {isEn ? d.name : d.nameHindi || d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3. GRAM PANCHAYAT & VILLAGE SELECTORS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
            {isEn ? 'Gram Panchayat' : 'ग्राम पंचायत'}
          </label>
          <select
            value={selectedPanchayat}
            onChange={(e) => handlePanchayatChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {dynamicPanchayats.map((gp) => (
              <option key={gp} value={gp}>
                {gp}
              </option>
            ))}
            <option value="__other__">{isEn ? 'Other (Custom)' : 'अन्य (खुद लिखें)'}</option>
          </select>
          {selectedPanchayat === '__other__' && (
            <Input
              type="text"
              required
              value={customPanchayat}
              onChange={(e) => setCustomPanchayat(e.target.value)}
              placeholder={isEn ? 'Panchayat Name' : 'ग्राम पंचायत का नाम'}
              className="h-8 text-xs mt-1"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
            {isEn ? 'Village' : 'ग्राम / गांव'}
          </label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {dynamicVillages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
            <option value="__other__">{isEn ? 'Other (Custom)' : 'अन्य (खुद लिखें)'}</option>
          </select>
          {selectedVillage === '__other__' && (
            <Input
              type="text"
              required
              value={customVillage}
              onChange={(e) => setCustomVillage(e.target.value)}
              placeholder={isEn ? 'Village Name' : 'गांव का नाम'}
              className="h-8 text-xs mt-1"
            />
          )}
        </div>
      </div>

      {/* ── 4. OCCUPATION ── */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5 text-stone-400" />
          <span>{isEn ? 'Occupation / Profession' : 'पेशा / व्यवसाय'}</span>
        </label>
        <Input
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder={isEn ? 'e.g. Student, Farmer, Teacher' : 'उदा. छात्र, किसान, शिक्षक, व्यापार'}
          className="h-10 text-xs rounded-xl"
        />
      </div>

      {/* ── 5. PLEDGE CHECKBOX ── */}
      <div
        onClick={() => setPledgeAccepted(!pledgeAccepted)}
        className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 cursor-pointer flex items-start gap-3 transition-colors"
      >
        <div
          className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            pledgeAccepted
              ? 'bg-amber-600 border-amber-600 text-white'
              : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900'
          }`}
        >
          {pledgeAccepted && <Check className="w-3.5 h-3.5" />}
        </div>
        <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed select-none">
          {isEn
            ? 'I pledge to contribute selflessly towards the development, youth empowerment, and welfare of the village under Gramodaya Youth Manch.'
            : 'मैं ग्रामोदय यूथ मंच के अंतर्गत गांव के विकास, युवा सशक्तिकरण और जनकल्याण के लिए निस्वार्थ भाव से कार्य करने का संकल्प लेता/लेती हूँ।'}
        </p>
      </div>

      {/* ── 6. NAVIGATION & SUBMIT BUTTONS ── */}
      <div className="pt-2 flex items-center gap-2.5">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? 'Back' : 'पीछे'}</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !pledgeAccepted}
          className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{isEn ? 'Submit Membership Request' : 'सदस्यता आवेदन जमा करें'}</span>
              <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
