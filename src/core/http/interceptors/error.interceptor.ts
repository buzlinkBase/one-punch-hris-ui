import type { AxiosInstance, AxiosError } from "axios";
import { refreshAccessToken } from "@/core/auth/auth-refresh";
import { getNotify } from "@/shared/utils/notify";
import type { ErrorResponse } from "@/shared/types/api-response.model";

export function applyErrorInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const original = error.config as typeof error.config & { _retry?: boolean };

      if (error.response?.status === 401 && !original?._retry) {
        original._retry = true;
        try {
          const token = await refreshAccessToken();
          original.headers!.Authorization = `Bearer ${token}`;
          return instance(original);
        } catch {
          // refreshAccessToken already clears storage and redirects to login
          return Promise.reject(error);
        }
      }

      // error.response.data = ResponseModel<ProblemDetails> { status, message, data: ProblemDetails }
      const problemDetails = error.response?.data?.data;
      const description =
        problemDetails?.innerException ??
        problemDetails?.detail ??
        error.response?.data?.message ??
        error.message ??
        "An unexpected error occurred.";
      const message = problemDetails?.title ?? getStatusTitle(error.response?.status);

      try {
        getNotify().error({ message, description, placement: "topRight" });
      } catch {
        // NotificationProvider not yet mounted (e.g. network error on initial load)
      }

      return Promise.reject(error);
    },
  );
}

function getStatusTitle(status?: number): string {
  switch (status) {
    case 400: return "Bad Request";
    case 401: return "Unauthorized";
    case 403: return "Forbidden";
    case 404: return "Not Found";
    case 422: return "Validation Error";
    case 500: return "Server Error";
    default:  return "Request Failed";
  }
}
