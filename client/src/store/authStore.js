// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    token: null,
    setAuth: (user, token) => set({ user, token }),
    logout: () => set({ user: null, token: null }),
    isAdmin: () => false
  }),
  {
    name: 'autonexus-auth',
    getStorage: () => localStorage,
    partialize: (state) => ({ user: state.user, token: state.token })
  }
));
