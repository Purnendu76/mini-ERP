import { create } from "zustand";
import type { AuthUser, LoginCredentials } from "@/types/auth.types";
import { getRegisteredUsers } from "@/lib/registeredUsers";
import {
  clearAuthCookies,
  getAuthToken,
  getAuthUser,
  setAuthCookies,
} from "@/lib/authCookies";
import bcrypt from "bcryptjs";

type AuthStore = {
  user: AuthUser | null;
  token: string | undefined;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;
};

function generateMockToken(user: AuthUser) {
  return btoa(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: new Date().toISOString(),
    })
  );
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: getAuthUser(),
  token: getAuthToken(),
  isAuthenticated: Boolean(getAuthToken()),

  login: async (credentials) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const registeredUsers = getRegisteredUsers();
    const email = credentials.email.trim().toLowerCase();
    
    const matchedUser = registeredUsers.find(
      (user) => user.email.trim().toLowerCase() === email
    );

    if (!matchedUser) {
      return false;
    }

    // Verify hashed password
    const isPasswordValid = bcrypt.compareSync(credentials.password.trim(), matchedUser.password);

    if (!isPasswordValid) {
      return false;
    }

    if (matchedUser.status !== "Active") {
      throw new Error("Your account is currently inactive. Please contact your administrator.");
    }

    const authUser: AuthUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      status: matchedUser.status,
      photo: matchedUser.photo,
    };

    const token = generateMockToken(authUser);

    setAuthCookies(token, authUser);

    set({
      user: authUser,
      token,
      isAuthenticated: true,
    });

    return true;
  },

  logout: () => {
    clearAuthCookies();

    set({
      user: null,
      token: undefined,
      isAuthenticated: false,
    });
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