import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Village, VillageSettings } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';

export interface VillageState {
  activeVillageId: string;
  activeVillageSlug: string;
  settings: VillageSettings;
  villagesList: Village[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
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

// ── 1. ASYNC THUNKS (createAsyncThunk with Axios) ──

export const updateVillageSettingsThunk = createAsyncThunk(
  'village/updateVillageSettingsThunk',
  async (settingsData: Partial<VillageSettings>, { rejectWithValue }) => {
    try {
      const data = await apiClient.put('/api/village-settings', settingsData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to update village settings');
      }
      return data.settings;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchVillagesList = createAsyncThunk(
  'village/fetchVillagesList',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/villages');
      return data.villages || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── 2. INITIAL STATE ──

const initialState: VillageState = {
  activeVillageId: 'vil_rasoolpur',
  activeVillageSlug: 'rasoolpur',
  settings: DEFAULT_VILLAGE_SETTINGS,
  villagesList: [],
  status: 'idle',
  error: null,
};

// ── 3. SLICE DEFINITION ──

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
    builder
      .addCase(updateVillageSettingsThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.settings = { ...state.settings, ...action.payload };
        }
      })
      .addCase(fetchVillagesList.fulfilled, (state, action) => {
        state.villagesList = action.payload;
      });
  },
});

export const { setActiveVillage, updateVillageSettings, setVillagesList } = villageSlice.actions;
export default villageSlice.reducer;
