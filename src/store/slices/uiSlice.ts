import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Member } from '@/src/types';

export interface UiState {
  activeSection: string;
  previousSection: string | null;
  lang: 'hi' | 'en';
  modals: {
    isLoginModalOpen: boolean;
    isJoinModalOpen: boolean;
    isProfileModalOpen: boolean;
    isChatModalOpen: boolean;
    isIdCardModalOpen: boolean;
  };
  selectedChatPartner: Member | null;
  selectedIdCardMember: Member | null;
}

const initialState: UiState = {
  activeSection: 'home',
  previousSection: null,
  lang: 'hi',
  modals: {
    isLoginModalOpen: false,
    isJoinModalOpen: false,
    isProfileModalOpen: false,
    isChatModalOpen: false,
    isIdCardModalOpen: false,
  },
  selectedChatPartner: null,
  selectedIdCardMember: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<string>) => {
      if (state.activeSection !== action.payload) {
        state.previousSection = state.activeSection;
        state.activeSection = action.payload;
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    goBack: (state) => {
      if (state.previousSection) {
        const target = state.previousSection;
        state.previousSection = null;
        state.activeSection = target;
      } else {
        state.activeSection = 'home';
      }
    },
    setLanguage: (state, action: PayloadAction<'hi' | 'en'>) => {
      state.lang = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('gym_lang', action.payload);
      }
    },
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modals.isLoginModalOpen = action.payload;
    },
    setJoinModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modals.isJoinModalOpen = action.payload;
    },
    setProfileModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modals.isProfileModalOpen = action.payload;
    },
    setChatModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modals.isChatModalOpen = action.payload;
    },
    setIdCardModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modals.isIdCardModalOpen = action.payload;
    },
    setSelectedChatPartner: (state, action: PayloadAction<Member | null>) => {
      state.selectedChatPartner = action.payload;
      state.modals.isChatModalOpen = Boolean(action.payload);
    },
    setSelectedIdCardMember: (state, action: PayloadAction<Member | null>) => {
      state.selectedIdCardMember = action.payload;
      state.modals.isIdCardModalOpen = Boolean(action.payload);
    },
  },
});

export const {
  setActiveSection,
  goBack,
  setLanguage,
  setLoginModalOpen,
  setJoinModalOpen,
  setProfileModalOpen,
  setChatModalOpen,
  setIdCardModalOpen,
  setSelectedChatPartner,
  setSelectedIdCardMember,
} = uiSlice.actions;

export default uiSlice.reducer;
