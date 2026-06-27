import { decodeJwt } from "./jwt.util";

const KEYS = {
  token: "auth_token",
  user: "auth_user",
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
  save(token: string, user: AuthUser) {
    localStorage.setItem(KEYS.token, token);
    localStorage.setItem(KEYS.user, JSON.stringify(user));
  },

  getToken(): string | null {
    return localStorage.getItem(KEYS.token);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(KEYS.user);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  isAccessTokenExpired(): boolean {
    const token = localStorage.getItem(KEYS.token);
    if (!token) return true;

    const payload = decodeJwt(token);

    console.log("Token payload:", payload);

    if (!payload?.exp) return false;

    const expiryMs = payload.exp * 1000 - EXPIRY_BUFFER_MS;
    return Date.now() >= expiryMs;
  },

  clear() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
