const KEYS = {
  token: "auth_token",
  refreshToken: "auth_refresh_token",
  user: "auth_user",
  expiry: "auth_expiry",
} as const;

export interface AuthUser {
  email: string;
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

  isExpired(): boolean {
    const expiry = localStorage.getItem(KEYS.expiry);
    return expiry ? new Date(expiry) < new Date() : false;
  },

  clear() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
