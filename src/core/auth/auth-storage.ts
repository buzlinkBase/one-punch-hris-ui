import { decodeJwt } from "./jwt.util";

const KEYS = {
  token: "auth_token",
  refreshToken: "auth_refresh_token",
  user: "auth_user",
  expiry: "auth_expiry",
  name: "name",
  role: "role",
} as const;

const EXPIRY_BUFFER_MS = 60_000;

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

export const authStorage = {
  save(token: string, refreshToken: string, user: AuthUser, expiry?: string) {
    localStorage.setItem(KEYS.token, token);
    localStorage.setItem(KEYS.refreshToken, refreshToken);
    localStorage.setItem(KEYS.user, JSON.stringify(user));
    if (expiry) localStorage.setItem(KEYS.expiry, expiry);
  },

  getToken(): string | null {
    return localStorage.getItem(KEYS.token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.refreshToken);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(KEYS.user);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  isAccessTokenExpired(): boolean {
    const token = localStorage.getItem(KEYS.token);
    if (!token) return true;

    const payload = decodeJwt(token);

    if (!payload?.exp) return false;

    const expiryMs = payload.exp * 1000 - EXPIRY_BUFFER_MS;
    return Date.now() >= expiryMs;
  },

  isRefreshTokenExpired(): boolean {
    const expiry = localStorage.getItem(KEYS.expiry);
    if (!expiry) return false;
    return Date.now() >= new Date(expiry).getTime();
  },

  clear() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
