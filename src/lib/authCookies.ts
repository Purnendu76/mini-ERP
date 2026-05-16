import Cookies from "js-cookie";
import type { AuthUser } from "@/types/auth.types";

const TOKEN_KEY = "erp_token";
const USER_KEY = "erp_user";

const cookieOptions = {
  expires: 1, // 1 day
  sameSite: "strict" as const,
  secure: window.location.protocol === "https:",
};

export function setAuthCookies(token: string, user: AuthUser) {
  Cookies.set(TOKEN_KEY, token, cookieOptions);
  Cookies.set(USER_KEY, JSON.stringify(user), cookieOptions);
}

export function getAuthToken() {
  return Cookies.get(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const user = Cookies.get(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthCookies() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}