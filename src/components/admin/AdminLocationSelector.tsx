'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Globe, ChevronDown, Lock } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';

export interface LocationScope {
  state: string;
  district: string;
  villageId: string;
}

interface AdminLocationSelectorProps {
  selectedState?: string;
  selectedDistrict?: string;
  selectedVillageId?: string;
  onChange?: (scope: LocationScope) => void;
  compact?: boolean;
  className?: string;
}

export const AdminLocationSelector: React.FC<AdminLocationSelectorProps> = ({
  selectedState = 'ALL',
  selectedDistrict = 'ALL',
  selectedVillageId = '',
  onChange,
  compact = false,
  className = '',
}) => {
  const {
    villages,
    activeVillageId,
    setActiveVillageId,
    authSession,
    isSuperAdmin,
    villageSettings,
  } = useApp();

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

  // Sync if assigned village changes for local admin
  useEffect(() => {
    if (!isSuperAdminUser && assignedAdminVillageId) {
      setVillageId(assignedAdminVillageId);
      setActiveVillageId(assignedAdminVillageId);
    }
  }, [isSuperAdminUser, assignedAdminVillageId, setActiveVillageId]);

  // 1. Dynamically derive unique States from registered villages & settings
  const dynamicStates = useMemo(() => {
    const states = new Set<string>();
    villages.forEach((v) => {
      const st = (v as any).state || (v as any).stateName || villageSettings.state || 'Uttar Pradesh';
      if (st) states.add(st);
    });
    if (villageSettings.state) states.add(villageSettings.state);
    return Array.from(states);
  }, [villages, villageSettings]);

  // 2. Dynamically derive unique Districts for the chosen State
  const dynamicDistricts = useMemo(() => {
    const districts = new Set<string>();
    villages.forEach((v) => {
      const vState = (v as any).state || (v as any).stateName || villageSettings.state || 'Uttar Pradesh';
      if (state === 'ALL' || !state || vState === state) {
        const dst = v.districtName || (v as any).district || villageSettings.district || 'Jaunpur';
        if (dst) districts.add(dst);
      }
    });
    if (villageSettings.district) districts.add(villageSettings.district);
    return Array.from(districts);
  }, [villages, villageSettings, state]);

  // 3. Dynamically filter Villages based on selected State & District
  const dynamicFilteredVillages = useMemo(() => {
    return villages.filter((v) => {
      const vState = (v as any).state || (v as any).stateName || villageSettings.state || 'Uttar Pradesh';
      const vDistrict = v.districtName || (v as any).district || villageSettings.district || 'Jaunpur';

      const matchesState = state === 'ALL' || !state || vState === state;
      const matchesDistrict = district === 'ALL' || !district || vDistrict === district;
      return matchesState && matchesDistrict;
    });
  }, [villages, villageSettings, state, district]);

  const currentVillage = villages.find((v) => v.id === villageId) || villages[0];

  const handleStateChange = (newState: string) => {
    setState(newState);
    setDistrict('ALL');
    setVillageId('ALL');
    setActiveVillageId('ALL');
    onChange?.({ state: newState, district: 'ALL', villageId: 'ALL' });
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setVillageId('ALL');
    setActiveVillageId('ALL');
    onChange?.({ state, district: newDistrict, villageId: 'ALL' });
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
        <div
          className={`flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-xl text-xs ${className}`}
        >
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
      <div
        className={`bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 shadow-xs space-y-2 ${className}`}
      >
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
          You are signed in as the chapter admin for{' '}
          <strong className="text-slate-900 dark:text-white font-bold">
            {currentVillage?.name}{' '}
            {currentVillage?.nameHindi ? `(${currentVillage.nameHindi})` : ''}
          </strong>
          . You have permissions to view and manage only your village&apos;s data.
        </p>
      </div>
    );
  }

  // Super Admin view: fully dynamic selector
  if (compact) {
    return (
      <div
        className={`flex items-center gap-1.5 bg-slate-100 dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] p-1 rounded-xl text-xs ${className}`}
      >
        {/* Dynamic State Selector */}
        <div className="relative flex items-center">
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="appearance-none bg-transparent pl-2 pr-5 py-1 text-[11px] font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
            title="Select State"
          >
            <option value="ALL" className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white">
              All States
            </option>
            {dynamicStates.map((st) => (
              <option
                key={st}
                value={st}
                className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white"
              >
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500 absolute right-1 pointer-events-none" />
        </div>

        <span className="text-slate-300 dark:text-zinc-700">/</span>

        {/* Dynamic District Selector */}
        <div className="relative flex items-center">
          <select
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="appearance-none bg-transparent pl-2 pr-5 py-1 text-[11px] font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
            title="Select District"
          >
            <option value="ALL" className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white">
              All Districts
            </option>
            {dynamicDistricts.map((dst) => (
              <option
                key={dst}
                value={dst}
                className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white"
              >
                {dst}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500 absolute right-1 pointer-events-none" />
        </div>

        <span className="text-slate-300 dark:text-zinc-700">/</span>

        {/* Dynamic Village Selector */}
        <div className="relative flex items-center">
          <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-1 mr-0.5" />
          <select
            value={villageId}
            onChange={(e) => handleVillageChange(e.target.value)}
            className="appearance-none bg-transparent pl-1 pr-5 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-400 outline-none cursor-pointer"
            title="Select Village Unit"
          >
            <option
              value="ALL"
              className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white"
            >
              All Villages
            </option>
            {dynamicFilteredVillages.map((v) => (
              <option
                key={v.id}
                value={v.id}
                className="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white"
              >
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
    <div
      className={`bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 shadow-xs space-y-3 ${className}`}
    >
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
        {/* Dynamic State Select */}
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
              <option value="ALL">All States</option>
              {dynamicStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Dynamic District Select */}
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
              <option value="ALL">All Districts</option>
              {dynamicDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Dynamic Village Unit Select */}
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
              {dynamicFilteredVillages.map((v) => (
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
