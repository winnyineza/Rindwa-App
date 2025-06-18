// @ts-nocheck - Disable TypeScript checking for this file temporarily
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isDrawerOpen: boolean;
  isLoading: boolean;
  activeModal: string | null;
  toasts: Toast[];
  lastError: string | null;
  networkStatus: 'online' | 'offline';
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

const initialState: UIState = {
  theme: 'system',
  isDrawerOpen: false,
  isLoading: false,
  activeModal: null,
  toasts: [],
  lastError: null,
  networkStatus: 'online',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.theme = action.payload;
    },
    toggleDrawer(state) {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    setDrawerState(state, action: PayloadAction<boolean>) {
      state.isDrawerOpen = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    showModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    hideModal(state) {
      state.activeModal = null;
    },
    addToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      const id = Date.now().toString();
      state.toasts.push({
        id,
        ...action.payload,
      });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
    setLastError(state, action: PayloadAction<string | null>) {
      state.lastError = action.payload;
    },
    setNetworkStatus(state, action: PayloadAction<'online' | 'offline'>) {
      state.networkStatus = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleDrawer,
  setDrawerState,
  setLoading,
  showModal,
  hideModal,
  addToast,
  removeToast,
  clearToasts,
  setLastError,
  setNetworkStatus,
} = uiSlice.actions;

export default uiSlice.reducer;
