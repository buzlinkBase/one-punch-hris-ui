import type { AxiosInstance, AxiosError } from "axios";
import { refreshAccessToken } from "@/core/auth/auth-refresh";

export function applyErrorInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as typeof error.config & { _retry?: boolean };

      if (error.response?.status === 401 && !original?._retry) {
        original._retry = true;
        try {
          const token = await refreshAccessToken();
          original.headers!.Authorization = `Bearer ${token}`;
          return instance(original);
        } catch {
          // refreshAccessToken already clears storage and redirects
        }
      }

      return Promise.reject(error);
    },
  );
}
