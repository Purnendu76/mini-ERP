import { create } from "zustand";
import type { AuthUser, LoginCredentials } from "@/types/auth.types";
import {
  clearAuthCookies,
  getAuthToken,
  getAuthUser,
  setAuthCookies,
} from "@/lib/authCookies";
import { axiosClient } from "@/api/axiosClient";

type AuthStore = {
  user: AuthUser | null;
  token: string | undefined;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: getAuthUser(),
  token: getAuthToken(),
  isAuthenticated: Boolean(getAuthToken()),

  login: async (credentials) => {
    try {
      const response = await axiosClient.post("/auth/login", {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password.trim(),
      });

      if (response.status === 200 && response.data.token) {
        const { token, user } = response.data;
        setAuthCookies(token, user);

        set({
          user,
          token,
          isAuthenticated: true,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  logout: async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      clearAuthCookies();

      set({
        user: null,
        token: undefined,
        isAuthenticated: false,
      });
    }
  },

  initializeAuth: () => {
    const token = getAuthToken();
    const user = getAuthUser();

    set({
      token,
      user,
      isAuthenticated: Boolean(token && user),
    });
  },
}));