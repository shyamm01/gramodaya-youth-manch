'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Building, Globe, ChevronDown, Check, Lock } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';

export interface LocationScope {
  state: string;
  district: string;
  villageId: string;
}

export const STATE_DISTRICT_MAP: Record<string, string[]> = {
  'Uttar Pradesh': [
    'Jaunpur',
    'Varanasi',
    'Prayagraj',
    'Gorakhpur',
    'Azamgarh',
    'Lucknow',
    'Ayodhya',
    'Mirzapur',
    'Ghazipur',
    'Ballia',
    'Sultanpur',
    'Bhadohi',
    'Kanpur Nagar',
  ],
  'Bihar': [
    'Patna',
    'Gaya',
    'Muzaffarpur',
    'Bhagalpur',
    'Darbhanga',
    'Saran',
    'Rohtas',
    'Bhojpur',
  ],
  'Madhya Pradesh': [
    'Bhopal',
    'Indore',
    'Jabalpur',
    'Gwalior',
    'Rewa',
    'Satna',
  ],
  'Rajasthan': [
    'Jaipur',
    'Jodhpur',
    'Kota',
    'Udaipur',
    'Bikaner',
  ],
  'Maharashtra': [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Thane',
  ],
  'Delhi': [
    'Central Delhi',
    'New Delhi',
    'North Delhi',
    'South Delhi',
  ],
};

interface AdminLocationSelectorProps {
  selectedState?: string;
  selectedDistrict?: string;
  selectedVillageId?: string;
  onChange?: (scope: { state: string; district: string; villageId: string }) => void;
  compact?: boolean;
  className?: string;
}

export const AdminLocationSelector: React.FC<AdminLocationSelectorProps> = ({
  selectedState = 'Uttar Pradesh',
  selectedDistrict = 'Jaunpur',
  selectedVillageId = '',
  onChange,
  compact = false,
  className = '',
}) => {
  const { villages, activeVillageId, setActiveVillageId, authSession, isSuperAdmin } = useApp();

  const isSuperAdminUser = Boolean(
    isSuperAdmin ||
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678' ||
    authSession.adminMobile === '8887754321' ||
    authSession.adminUser?.isHead
  );

  const assignedAdminVillageId =
    authSession.adminVillageId ||
    authSession.adminUser?.villageId ||
    authSession.currentMember?.villageId ||
    'vil_rasoolpur';

  const [state, setState] = useState<string>(selectedState);
  const [district, setDistrict] = useState<string>(selectedDistrict);
  const [villageId, setVillageId] = useState<string>(
    isSuperAdminUser
      ? (selectedVillageId || activeVillageId || 'ALL')
      : assignedAdminVillageId
  );

  // Sync if assigned village changes
  useEffect(() => {
    if (!isSuperAdminUser && assignedAdminVillageId) {
      setVillageId(assignedAdminVillageId);
      setActiveVillageId(assignedAdminVillageId);
    }
  }, [isSuperAdminUser, assignedAdminVillageId, setActiveVillageId]);

  const availableDistricts = STATE_DISTRICT_MAP[state] || ['All Districts'];
  const currentVillage = villages.find((v) => v.id === villageId) || villages[0];

  const handleStateChange = (newState: string) => {
    setState(newState);
    const firstDistrict = STATE_DISTRICT_MAP[newState]?.[0] || 'All Districts';
    setDistrict(firstDistrict);
    onChange?.({ state: newState, district: firstDistrict, villageId });
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    onChange?.({ state, district: newDistrict, villageId });
  };

  const handleVillageChange = (newVillageId: string) => {
    setVillageId(newVillageId);
    setActiveVillageId(newVillageId);
    onChange?.({ state, district, villageId: newVillageId });
  };

  // If local admin (not Super Admin), show locked scoped badge
  if (!isSuperAdminUser) {
    if (compact) {
      return (
        <div className={`flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-xl text-xs ${className}`}>
          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            {currentVillage?.name || 'Local Chapter'}
          </span>
          <span className="text-[9px] font-mono uppercase bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 px-1 py-0.2 rounded">
            Scoped
          </span>
        </div>
      );
    }

    return (
      <div className={`bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 shadow-xs space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Admin Scope
            </h4>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md border border-emerald-300/40 dark:border-emerald-800/40">
            <Lock className="w-2.5 h-2.5" /> Scoped to Your Village
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-zinc-400">
          You are signed in as the chapter admin for <strong className="text-slate-900 dark:text-white font-bold">{currentVillage?.name} {currentVillage?.nameHindi ? `(${currentVillage.nameHindi})` : ''}</strong>. You have permissions to view and manage only your village&apos;s data.
        </p>
      </div>
    );
  }

  // Super Admin view: full selector
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 bg-slate-100 dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] p-1 rounded-xl text-xs ${className}`}>
        {/* State Selector */}
        <div className="relative flex items-center">
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="appearance-none bg-transparent pl-2 pr-5 py-1 text-[11px] font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
            title="Select State"
          >
            {Object.keys(STATE_DISTRICT_MAP).map((st) => (
              <option key={st} value={st} className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white">
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500 absolute right-1 pointer-events-none" />
        </div>

        <span className="text-slate-300 dark:text-zinc-700">/</span>

        {/* District Selector */}
        <div className="relative flex items-center">
          <select
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="appearance-none bg-transparent pl-2 pr-5 py-1 text-[11px] font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
            title="Select District"
          >
            {availableDistricts.map((dst) => (
              <option key={dst} value={dst} className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white">
                {dst}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500 absolute right-1 pointer-events-none" />
        </div>

        <span className="text-slate-300 dark:text-zinc-700">/</span>

        {/* Village Selector */}
        <div className="relative flex items-center">
          <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-1 mr-0.5" />
          <select
            value={villageId}
            onChange={(e) => handleVillageChange(e.target.value)}
            className="appearance-none bg-transparent pl-1 pr-5 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-400 outline-none cursor-pointer"
            title="Select Village Unit"
          >
            <option value="ALL" className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white">
              All Villages
            </option>
            {villages.map((v) => (
              <option key={v.id} value={v.id} className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white">
                {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500 absolute right-1 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 shadow-xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Jurisdiction & Location Scope
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">
          Super Admin Global Jurisdiction
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* State Select */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
            State
          </label>
          <div className="relative">
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {Object.keys(STATE_DISTRICT_MAP).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* District Select */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
            District
          </label>
          <div className="relative">
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Village Unit Select */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
            Village Chapter
          </label>
          <div className="relative">
            <select
              value={villageId}
              onChange={(e) => handleVillageChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="ALL">All Villages (Global View)</option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
