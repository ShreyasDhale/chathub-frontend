import { create } from "zustand";

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;

  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,

  setToken: (token) =>
    set({
      token,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      token: null,
      isAuthenticated: false,
    }),
}));
