import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { GalleryItem } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface GalleryState {
  items: GalleryItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GalleryState = {
  items: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchGallery = createAsyncThunk(
  'gallery/fetchGallery',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/gallery?villageId=${encodeURIComponent(villageId)}` : '/api/gallery';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.gallery)) {
        return data.gallery as GalleryItem[];
      }
      return (data?.gallery || []) as GalleryItem[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch gallery');
    }
  }
);

export const uploadGalleryPhoto = createAsyncThunk(
  'gallery/uploadGalleryPhoto',
  async (photoData: { caption: string; photoUrl: string; villageId?: string }, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/gallery', photoData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to upload photo');
      }
      return data.item as GalleryItem;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const approveGalleryPhoto = createAsyncThunk(
  'gallery/approveGalleryPhoto',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.patch(`/api/gallery/${id}`, { status: 'published' });
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to approve photo');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteGalleryPhoto = createAsyncThunk(
  'gallery/deleteGalleryPhoto',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/gallery/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete photo');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    setGallery: (state, action: PayloadAction<GalleryItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGallery.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(uploadGalleryPhoto.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(approveGalleryPhoto.fulfilled, (state, action) => {
        const item = state.items.find((g) => g.id === action.payload);
        if (item) item.status = 'published';
      })
      .addCase(deleteGalleryPhoto.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.id !== action.payload);
      });
  },
});

export const { setGallery } = gallerySlice.actions;

// ── SELECTORS ──

export const selectAllGalleryPhotos = (state: RootState) => state.gallery?.items || [];
export const selectGalleryLoading = (state: RootState) => state.gallery?.status === 'loading';

export const selectPublishedGalleryPhotos = createSelector(
  [selectAllGalleryPhotos],
  (items) => items.filter((g) => g.status === 'published')
);

export const selectPendingGalleryPhotos = createSelector(
  [selectAllGalleryPhotos],
  (items) => items.filter((g) => g.status === 'pending')
);

export default gallerySlice.reducer;
