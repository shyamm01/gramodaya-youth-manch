import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Village, VillageSettings } from '@/src/types';
import { gymApi } from '../services/gymApi';

export interface VillageState {
  activeVillageId: string;
  activeVillageSlug: string;
  settings: VillageSettings;
  villagesList: Village[];
}

export const DEFAULT_VILLAGE_SETTINGS: VillageSettings = {
  id: 'vil_rasoolpur',
  slug: 'rasoolpur',
  name: 'RASOOLPUR',
  nameHindi: 'रसूलपुर',
  gramPanchayat: 'BAHERA',
  gramPanchayatHindi: 'बहेरा',
  district: 'Hardoi',
  districtHindi: 'हरदोई',
  state: 'Uttar Pradesh',
  stateHindi: 'उत्तर प्रदेश',
  taglineHindi: 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
  sloganHindi: 'युवा शक्ति से ग्रामोदय की ओर।',
  orgName: 'GRAMODAYA YOUTH MANCH',
  orgNameHindi: '🌱 ग्रामोदय यूथ मंच 🌱',
  orgPurposeHindi:
    'ग्रामोदय यूथ मंच गांव के युवाओं, परिवारों और बुजुर्गों को एक साथ जोड़कर ग्राम विकास, शिक्षा, रोजगार, स्वच्छता, पर्यावरण, सामाजिक जागरूकता और जरूरतमंद लोगों की सहायता के लिए कार्य करने का एक सामुदायिक मंच है।',
};

const initialState: VillageState = {
  activeVillageId: 'vil_rasoolpur',
  activeVillageSlug: 'rasoolpur',
  settings: DEFAULT_VILLAGE_SETTINGS,
  villagesList: [],
};

export const villageSlice = createSlice({
  name: 'village',
  initialState,
  reducers: {
    setActiveVillage: (state, action: PayloadAction<{ id: string; slug?: string }>) => {
      state.activeVillageId = action.payload.id;
      if (action.payload.slug) {
        state.activeVillageSlug = action.payload.slug;
      }
    },
    updateVillageSettings: (state, action: PayloadAction<Partial<VillageSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setVillagesList: (state, action: PayloadAction<Village[]>) => {
      state.villagesList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(gymApi.endpoints.getAppData.matchFulfilled, (state, action) => {
      if (action.payload.villageSettings) {
        state.settings = action.payload.villageSettings;
      }
      if (action.payload.villages) {
        state.villagesList = action.payload.villages;
      }
    });
  },
});

export const { setActiveVillage, updateVillageSettings, setVillagesList } = villageSlice.actions;
export default villageSlice.reducer;
