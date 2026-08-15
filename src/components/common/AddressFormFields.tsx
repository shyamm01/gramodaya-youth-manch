import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { INITIAL_VILLAGES } from '@/src/data/initialData';
import { Input } from '@/src/components/ui/input';
import {
  MapPin,
  Building2,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Filter,
} from 'lucide-react';

export interface AddressData {
  pincode: string;
  state: string;
  district: string;
  block: string;
  postOffice: string;
  gramPanchayat: string;
  village: string;
  villageId?: string;
  houseNo?: string;
  street?: string;
  fullAddress?: string;
}

interface AddressFormFieldsProps {
  value?: Partial<AddressData>;
  onChange: (address: AddressData) => void;
  selectedVillageId?: string;
  onVillageSelect?: (villageId: string) => void;
  lang?: 'en' | 'hi';
  compact?: boolean;
  required?: boolean;
  className?: string;
}

export const AddressFormFields: React.FC<AddressFormFieldsProps> = ({
  value = {},
  onChange,
  selectedVillageId,
  onVillageSelect,
  lang = 'en',
  compact = false,
  required = false,
  className = '',
}) => {
  const { villages, villageSettings } = useApp();

  // Combine loaded villages with fallback seed villages so list is never empty
  const effectiveVillages = useMemo(() => {
    if (villages && villages.length > 0) return villages;
    return INITIAL_VILLAGES;
  }, [villages]);

  const [pincode, setPincode] = useState(value.pincode || '');
  const [state, setState] = useState(value.state || '');
  const [district, setDistrict] = useState(value.district || '');
  const [block, setBlock] = useState(value.block || '');
  const [postOffice, setPostOffice] = useState(value.postOffice || '');
  const [gramPanchayat, setGramPanchayat] = useState(value.gramPanchayat || '');
  const [village, setVillage] = useState(value.village || '');
  const [houseNo, setHouseNo] = useState(value.houseNo || '');
  const [street, setStreet] = useState(value.street || '');

  const [postOfficesList, setPostOfficesList] = useState<string[]>([]);
  const [isLoadingPin, setIsLoadingPin] = useState(false);
  const [pinStatus, setPinStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  // 1. Extract unique registered Districts
  const availableDistricts = useMemo(() => {
    const distSet = new Set<string>();
    effectiveVillages.forEach((v) => {
      if (v.districtName) distSet.add(v.districtName);
    });
    if (villageSettings?.district) distSet.add(villageSettings.district);
    return Array.from(distSet);
  }, [effectiveVillages, villageSettings]);

  // 2. Extract unique Gram Panchayats registered in the platform (with District & Pincode metadata)
  const allGps = useMemo(() => {
    const gps = new Map<
      string,
      {
        name: string;
        nameHindi?: string;
        district: string;
        districtHindi?: string;
        state: string;
        pincode?: string;
        block?: string;
        postOffice?: string;
        villageId?: string;
        villageName?: string;
      }
    >();

    effectiveVillages.forEach((v) => {
      const gp = v.gramPanchayatName || v.gramPanchayatNameHindi || (v as any).gramPanchayat;
      if (gp && !gps.has(gp)) {
        gps.set(gp, {
          name: gp,
          nameHindi: v.gramPanchayatNameHindi,
          district: v.districtName || (v as any).district || villageSettings?.district || 'Hardoi',
          districtHindi: v.districtNameHindi || villageSettings?.districtHindi || 'हरदोई',
          state: (v as any).state || (v as any).stateName || villageSettings?.state || 'Uttar Pradesh',
          pincode: v.pincode || (v as any).pin || (villageSettings as any)?.pincode || '241125',
          block: v.blockName || (villageSettings as any)?.block || 'Hardoi',
          postOffice: v.postOffice || (villageSettings as any)?.postOffice || 'Bahera Rasoolpur',
          villageId: v.id,
          villageName: v.name,
        });
      }
    });

    if (villageSettings?.gramPanchayat && !gps.has(villageSettings.gramPanchayat)) {
      gps.set(villageSettings.gramPanchayat, {
        name: villageSettings.gramPanchayat,
        nameHindi: villageSettings.gramPanchayatHindi,
        district: villageSettings.district || 'Hardoi',
        districtHindi: villageSettings.districtHindi || 'हरदोई',
        state: villageSettings.state || 'Uttar Pradesh',
        pincode: (villageSettings as any)?.pincode || '241125',
        block: (villageSettings as any)?.block || 'Hardoi',
        postOffice: (villageSettings as any)?.postOffice || 'Bahera Rasoolpur',
        villageId: villageSettings.id || 'vil_rasoolpur',
        villageName: villageSettings.name || 'Rasoolpur',
      });
    }

    return Array.from(gps.values());
  }, [effectiveVillages, villageSettings]);

  // 3. Filter Gram Panchayats by Pincode and District
  const filteredGps = useMemo(() => {
    let list = allGps;

    // Filter by District if selected
    if (district && district.trim()) {
      const targetDist = district.trim().toLowerCase();
      const distMatches = list.filter((gp) => gp.district.toLowerCase() === targetDist);
      if (distMatches.length > 0) {
        list = distMatches;
      }
    }

    // Filter by Pincode if 6 digits
    if (pincode && pincode.trim().length === 6) {
      const targetPin = pincode.trim();
      const pinMatches = list.filter((gp) => gp.pincode === targetPin);
      if (pinMatches.length > 0) {
        list = pinMatches;
      }
    }

    return list;
  }, [allGps, district, pincode]);

  // 4. Filter available villages by Pincode, District, and Gram Panchayat
  const filteredVillages = useMemo(() => {
    let list = effectiveVillages;

    // Filter by Gram Panchayat if selected
    if (gramPanchayat && gramPanchayat.trim()) {
      const cleanGp = gramPanchayat.trim().toLowerCase();
      const gpMatches = list.filter((v) => {
        const gpEn = (v.gramPanchayatName || '').toLowerCase();
        const gpHn = (v.gramPanchayatNameHindi || '').toLowerCase();
        return gpEn.includes(cleanGp) || gpHn.includes(cleanGp) || cleanGp.includes(gpEn);
      });
      if (gpMatches.length > 0) return gpMatches;
    }

    // Filter by District if selected
    if (district && district.trim()) {
      const cleanDist = district.trim().toLowerCase();
      const distMatches = list.filter((v) => {
        const dEn = (v.districtName || '').toLowerCase();
        const dHn = (v.districtNameHindi || '').toLowerCase();
        return dEn.includes(cleanDist) || dHn.includes(cleanDist) || cleanDist.includes(dEn);
      });
      if (distMatches.length > 0) {
        list = distMatches;
      }
    }

    // Filter by Pincode if 6 digits
    if (pincode && pincode.trim().length === 6) {
      const cleanPin = pincode.trim();
      const pinMatches = list.filter((v) => v.pincode === cleanPin);
      if (pinMatches.length > 0) {
        list = pinMatches;
      }
    }

    return list.length > 0 ? list : effectiveVillages;
  }, [effectiveVillages, gramPanchayat, district, pincode]);

  // Synchronize when outer value changes
  useEffect(() => {
    if (value.pincode && value.pincode !== pincode) setPincode(value.pincode);
    if (value.state && value.state !== state) setState(value.state);
    if (value.district && value.district !== district) setDistrict(value.district);
    if (value.block && value.block !== block) setBlock(value.block);
    if (value.postOffice && value.postOffice !== postOffice) setPostOffice(value.postOffice);
    if (value.gramPanchayat && value.gramPanchayat !== gramPanchayat) setGramPanchayat(value.gramPanchayat);
    if (value.village && value.village !== village) setVillage(value.village);
    if (value.houseNo && value.houseNo !== houseNo) setHouseNo(value.houseNo);
    if (value.street && value.street !== street) setStreet(value.street);
  }, [value]);

  // Emit change to parent
  const emitChange = useCallback(
    (updates: Partial<AddressData> = {}) => {
      const currentData: AddressData = {
        pincode: updates.pincode !== undefined ? updates.pincode : pincode,
        state: updates.state !== undefined ? updates.state : state,
        district: updates.district !== undefined ? updates.district : district,
        block: updates.block !== undefined ? updates.block : block,
        postOffice: updates.postOffice !== undefined ? updates.postOffice : postOffice,
        gramPanchayat: updates.gramPanchayat !== undefined ? updates.gramPanchayat : gramPanchayat,
        village: updates.village !== undefined ? updates.village : village,
        villageId: updates.villageId !== undefined ? updates.villageId : selectedVillageId,
        houseNo: updates.houseNo !== undefined ? updates.houseNo : houseNo,
        street: updates.street !== undefined ? updates.street : street,
      };

      const parts = [
        currentData.houseNo,
        currentData.street,
        currentData.village ? `ग्राम ${currentData.village}` : '',
        currentData.postOffice ? `पोस्ट ${currentData.postOffice}` : '',
        currentData.gramPanchayat ? `ग्राम पंचायत ${currentData.gramPanchayat}` : '',
        currentData.block ? `ब्लॉक ${currentData.block}` : '',
        currentData.district ? `जिला ${currentData.district}` : '',
        currentData.state,
        currentData.pincode ? `PIN-${currentData.pincode}` : '',
      ].filter(Boolean);

      currentData.fullAddress = parts.join(', ');
      onChange(currentData);
    },
    [pincode, state, district, block, postOffice, gramPanchayat, village, selectedVillageId, houseNo, street, onChange]
  );

  // 5. Handle District selection (Cascades to Gram Panchayats & Villages)
  const handleDistrictChange = (selectedDist: string) => {
    setDistrict(selectedDist);

    // Find default GP for this district
    const gpsInDist = allGps.filter((g) => g.district.toLowerCase() === selectedDist.toLowerCase());
    const defaultGp = gpsInDist[0];

    const newGpName = defaultGp?.name || '';
    const newPin = defaultGp?.pincode || pincode;
    const newBlock = defaultGp?.block || block;
    const newPo = defaultGp?.postOffice || postOffice;

    if (newGpName) setGramPanchayat(newGpName);
    if (newPin && !pincode) setPincode(newPin);
    if (newBlock) setBlock(newBlock);
    if (newPo) setPostOffice(newPo);

    emitChange({
      district: selectedDist,
      gramPanchayat: newGpName,
      pincode: newPin,
      block: newBlock,
      postOffice: newPo,
    });
  };

  // 6. Handle Gram Panchayat selection (Auto-fills location defaults)
  const handleGramPanchayatSelect = (gpName: string) => {
    setGramPanchayat(gpName);

    if (!gpName) {
      emitChange({ gramPanchayat: '' });
      return;
    }

    const match = allGps.find(
      (g) => g.name.toLowerCase() === gpName.toLowerCase()
    );

    const matchingVillages = effectiveVillages.filter((v) => {
      const gpEn = (v.gramPanchayatName || '').toLowerCase();
      const gpHn = (v.gramPanchayatNameHindi || '').toLowerCase();
      const target = gpName.toLowerCase();
      return gpEn.includes(target) || gpHn.includes(target) || target.includes(gpEn);
    });

    const firstVillage = matchingVillages[0] || (match?.villageId ? effectiveVillages.find((v) => v.id === match.villageId) : null);

    const newState = match?.state || state || 'Uttar Pradesh';
    const newDistrict = match?.district || district || 'Hardoi';
    const newBlock = match?.block || block || 'Hardoi';
    const newPin = match?.pincode || (pincode ? pincode : '241125');
    const newPo = match?.postOffice || postOffice || 'Bahera Rasoolpur';
    const newVillageName = firstVillage?.name || village || 'Rasoolpur';

    setState(newState);
    setDistrict(newDistrict);
    setBlock(newBlock);
    setPincode(newPin);
    setPostOffice(newPo);
    if (firstVillage) {
      setVillage(firstVillage.name);
      onVillageSelect?.(firstVillage.id);
    }

    emitChange({
      gramPanchayat: gpName,
      state: newState,
      district: newDistrict,
      block: newBlock,
      pincode: newPin,
      postOffice: newPo,
      village: newVillageName,
      villageId: firstVillage?.id,
    });
  };

  // 7. Handle Village select
  const handleVillageSelect = (selectedName: string, vId?: string) => {
    setVillage(selectedName);
    if (vId) {
      onVillageSelect?.(vId);
      const vObj = effectiveVillages.find((v) => v.id === vId);
      if (vObj) {
        const vGp = vObj.gramPanchayatName || vObj.gramPanchayatNameHindi;
        if (vGp) setGramPanchayat(vGp);
        if (vObj.districtName) setDistrict(vObj.districtName);
        if ((vObj as any).stateName || (vObj as any).state) setState((vObj as any).stateName || (vObj as any).state);
        if (vObj.pincode) setPincode(vObj.pincode);
        if (vObj.blockName) setBlock(vObj.blockName);
        if (vObj.postOffice) setPostOffice(vObj.postOffice);

        emitChange({
          village: selectedName,
          villageId: vId,
          gramPanchayat: vGp || gramPanchayat,
          district: vObj.districtName || district,
          pincode: vObj.pincode || pincode,
          block: vObj.blockName || block,
          postOffice: vObj.postOffice || postOffice,
        });
        return;
      }
    }
    emitChange({ village: selectedName, villageId: vId });
  };

  // 8. Handle Live Pincode Lookup & Dynamic Filter Cascade
  const handlePincodeChange = async (newPin: string) => {
    const cleanDigits = newPin.replace(/\D/g, '').slice(0, 6);
    setPincode(cleanDigits);

    if (cleanDigits.length < 6) {
      setPinStatus('idle');
      setPinErrorMsg('');
      emitChange({ pincode: cleanDigits });
      return;
    }

    setIsLoadingPin(true);
    setPinStatus('idle');
    setPinErrorMsg('');

    try {
      const res = await fetch(`/api/pincode/${cleanDigits}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const fetchedState = data.state || state;
        const fetchedDistrict = data.district || district;
        const fetchedBlock = data.block || '';
        const poList: string[] = Array.isArray(data.postOffices)
          ? data.postOffices.map((po: any) => (typeof po === 'string' ? po : po.name)).filter(Boolean)
          : [];

        setState(fetchedState);
        setDistrict(fetchedDistrict);
        if (fetchedBlock && !block) setBlock(fetchedBlock);
        setPostOfficesList(poList);
        if (poList.length > 0 && !postOffice) setPostOffice(poList[0]);

        setPinStatus('success');

        // Check if any registered GP matches this District/Pincode
        const matchingGp = allGps.find(
          (g) => g.pincode === cleanDigits || g.district.toLowerCase() === fetchedDistrict.toLowerCase()
        );

        const newGp = matchingGp?.name || gramPanchayat;
        if (matchingGp?.name && !gramPanchayat) {
          setGramPanchayat(matchingGp.name);
        }

        emitChange({
          pincode: cleanDigits,
          state: fetchedState,
          district: fetchedDistrict,
          block: fetchedBlock || block,
          postOffice: poList[0] || postOffice,
          gramPanchayat: newGp,
        });
      } else {
        setPinStatus('error');
        setPinErrorMsg(data.error || (lang === 'en' ? 'Pincode not found' : 'पिनकोड नहीं मिला'));
        emitChange({ pincode: cleanDigits });
      }
    } catch (err: any) {
      setPinStatus('error');
      setPinErrorMsg(lang === 'en' ? 'Lookup error' : 'पिनकोड खोजने में त्रुटि');
      emitChange({ pincode: cleanDigits });
    } finally {
      setIsLoadingPin(false);
    }
  };

  const currentActiveVillageId =
    selectedVillageId ||
    effectiveVillages.find((v) => v.name.toLowerCase() === village.toLowerCase())?.id ||
    filteredVillages[0]?.id ||
    'vil_rasoolpur';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── ROW 1: PINCODE & DISTRICT (PRIMARY CASCADING FILTERS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Pincode with Real-Time Lookup */}
        <div className="space-y-1">
          <div className="h-4 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? 'Pincode (Auto-Filters Location)' : 'पिनकोड (स्थान फिल्टर करेगा)'}</span>
              {required && <span className="text-rose-500">*</span>}
            </label>
            {isLoadingPin && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                <span>{lang === 'en' ? 'Fetching...' : 'खोज रहे हैं...'}</span>
              </span>
            )}
            {pinStatus === 'success' && !isLoadingPin && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-1.5 py-0.2 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Verified</span>
              </span>
            )}
          </div>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            placeholder="e.g. 241125"
            className={`h-9.5 text-xs font-mono font-bold tracking-wider rounded-xl transition-all ${
              pinStatus === 'success'
                ? 'border-emerald-500/80 focus:ring-emerald-500 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]'
                : pinStatus === 'error'
                ? 'border-rose-400 focus:ring-rose-400'
                : 'bg-white dark:bg-[#18181b] border-slate-200 dark:border-[#27272a]'
            }`}
          />
          {pinStatus === 'error' && pinErrorMsg && (
            <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5 font-medium">
              <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{pinErrorMsg}</span>
            </p>
          )}
        </div>

        {/* District Selector */}
        <div className="space-y-1">
          <div className="h-4 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? 'District' : 'जनपद / जिला'}</span>
              {required && <span className="text-rose-500">*</span>}
            </label>
            {district && (
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                {lang === 'en' ? 'Filters GP & Village' : 'GP व गांव फिल्टर'}
              </span>
            )}
          </div>
          <div className="relative">
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full h-9.5 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer appearance-none"
            >
              <option value="">{lang === 'en' ? '-- Choose District --' : '-- जिला चुनें --'}</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── ROW 2: GRAM PANCHAYAT & VILLAGE UNIT (FILTERED BY PINCODE & DISTRICT) ── */}
      <div className="p-3 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] rounded-2xl border border-emerald-500/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'en' ? 'Gram Panchayat & Village Chapter' : 'ग्राम पंचायत एवं ग्राम शाखा'}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-300/40 dark:border-emerald-800/40">
            {filteredGps.length} {lang === 'en' ? 'GPs Available' : 'पंचायतें उपलब्ध'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Select Gram Panchayat (Filtered by Pincode & District) */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
              <span>{lang === 'en' ? 'Gram Panchayat' : 'ग्राम पंचायत चुनें'} <span className="text-rose-500">*</span></span>
            </label>
            <div className="relative">
              <select
                value={gramPanchayat}
                onChange={(e) => handleGramPanchayatSelect(e.target.value)}
                className="w-full h-9.5 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer appearance-none"
              >
                <option value="">{lang === 'en' ? '-- Choose Gram Panchayat --' : '-- ग्राम पंचायत चुनें --'}</option>
                {filteredGps.map((gp) => (
                  <option key={gp.name} value={gp.name}>
                    {gp.name} {gp.nameHindi ? `(${gp.nameHindi})` : ''} - {gp.district}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Select Village (Filtered by GP, Pincode & District) */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block">
              {lang === 'en' ? 'Village / Chapter' : 'गांव / ग्राम शाखा'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={currentActiveVillageId}
                onChange={(e) => {
                  const chosenId = e.target.value;
                  const chosenObj = effectiveVillages.find((v) => v.id === chosenId);
                  if (chosenObj) {
                    handleVillageSelect(chosenObj.name, chosenId);
                  } else {
                    handleVillageSelect(village, '');
                  }
                }}
                className="w-full h-9.5 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-xs font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 cursor-pointer appearance-none"
              >
                <option value="">{lang === 'en' ? '-- Choose Village Unit --' : '-- ग्राम इकाई चुनें --'}</option>
                {filteredVillages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''} — {v.districtName || 'Hardoi'}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: STATE & BLOCK ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* State */}
        <div className="space-y-1">
          <div className="h-4 flex items-center">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              {lang === 'en' ? 'State' : 'राज्य'}
              {required && <span className="text-rose-500">*</span>}
            </label>
          </div>
          <Input
            type="text"
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              emitChange({ state: e.target.value });
            }}
            placeholder={lang === 'en' ? 'Auto-filled' : 'स्वतः भरा जाएगा'}
            className="h-9 text-xs font-bold rounded-xl bg-slate-50 dark:bg-[#18181b] border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-white"
          />
        </div>

        {/* Block / Tehsil */}
        <div className="space-y-1">
          <div className="h-4 flex items-center">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              {lang === 'en' ? 'Block / Tehsil' : 'ब्लॉक / तहसील'}
            </label>
          </div>
          <Input
            type="text"
            value={block}
            onChange={(e) => {
              setBlock(e.target.value);
              emitChange({ block: e.target.value });
            }}
            placeholder="e.g. Hardoi"
            className="h-9 text-xs rounded-xl bg-white dark:bg-[#18181b] border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* ── ROW 4: POST OFFICE & HOUSE / WARD / STREET ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Post Office */}
        <div className="space-y-1">
          <div className="h-4 flex items-center">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              {lang === 'en' ? 'Post Office' : 'डाकघर'}
            </label>
          </div>
          {postOfficesList.length > 1 ? (
            <select
              value={postOffice}
              onChange={(e) => {
                setPostOffice(e.target.value);
                emitChange({ postOffice: e.target.value });
              }}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {postOfficesList.map((po) => (
                <option key={po} value={po}>
                  {po}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type="text"
              value={postOffice}
              onChange={(e) => {
                setPostOffice(e.target.value);
                emitChange({ postOffice: e.target.value });
              }}
              placeholder="e.g. Bahera Rasoolpur"
              className="h-9 text-xs rounded-xl bg-white dark:bg-[#18181b] border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-white"
            />
          )}
        </div>

        {/* House / Ward / Street */}
        <div className="space-y-1">
          <div className="h-4 flex items-center">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              {lang === 'en' ? 'House / Ward / Street' : 'मकान / वार्ड / टोला'}
            </label>
          </div>
          <Input
            type="text"
            value={houseNo || street}
            onChange={(e) => {
              setHouseNo(e.target.value);
              setStreet(e.target.value);
              emitChange({ houseNo: e.target.value, street: e.target.value });
            }}
            placeholder="e.g. Ward 4"
            className="h-9 text-xs rounded-xl bg-white dark:bg-[#18181b] border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFormFields;
