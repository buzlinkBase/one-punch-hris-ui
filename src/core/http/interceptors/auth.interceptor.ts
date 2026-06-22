import type { AxiosInstance } from "axios";
import { authStorage } from "@/core/auth/auth-storage";
import { refreshAccessToken } from "@/core/auth/auth-refresh";

export function applyAuthInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(async (config) => {
    let token = authStorage.getToken();

    if (token && authStorage.isAccessTokenExpired()) {
      if (authStorage.isRefreshTokenExpired()) {
        authStorage.clear();
        window.location.href = "/login";
        return Promise.reject(new Error("Session expired"));
      }

      token = await refreshAccessToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}
