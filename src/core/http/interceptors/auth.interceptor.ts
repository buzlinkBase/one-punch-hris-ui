import type { AxiosInstance } from "axios";
import { authStorage } from "@/core/auth/auth-storage";
import { refreshAccessToken } from "@/core/auth/auth-refresh";

export function applyAuthInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(async (config) => {
    let token = authStorage.getToken();

    if (token && authStorage.isExpired()) {
      token = await refreshAccessToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}
