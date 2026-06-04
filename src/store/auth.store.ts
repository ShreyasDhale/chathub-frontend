import { create } from "zustand";

type AuthState = {
  token: string | null;
  userId: number | null;
  username: string | null;
  isAuthenticated: boolean;

  setAuth: (token: string, userId: number, username: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  username: null,
  isAuthenticated: false,

  setAuth: (token, userId, username) =>
    set({ token, userId, username, isAuthenticated: true }),

  setToken: (token) =>
    set({ token, isAuthenticated: true }),

  logout: () =>
    set({ token: null, userId: null, username: null, isAuthenticated: false }),
}));
