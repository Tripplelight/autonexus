// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    token: null,
    loginAt: null,
    setAuth: (user, token) => set({ user, token, loginAt: Date.now() }),
    logout: () => set({ user: null, token: null, loginAt: null }),
    isAdmin: () => false,
    checkExpiry: () => {
      const { loginAt, logout } = get();
      if (loginAt && Date.now() - loginAt > SEVEN_DAYS) logout();
    }
  }),
  {
    name: 'autonexus-auth',
    getStorage: () => localStorage,
    partialize: (state) => ({ user: state.user, token: state.token, loginAt: state.loginAt })
  }
));