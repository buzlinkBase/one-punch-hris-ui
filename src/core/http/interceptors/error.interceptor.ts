import type { AxiosInstance, AxiosError } from "axios";
import { getNotify } from "@/shared/utils/notify";
import type {
  ErrorResponse,
  ProblemDetails,
} from "@/shared/types/api-response.model";
import { useConnectionStore } from "@/core/stores/connection.store";

declare module "axios" {
  interface AxiosRequestConfig {
    _skipErrorNotification?: boolean;
  }
}

// A request that got no response at all (server unreachable, DNS/CORS failure, dropped
// connection, timeout) vs. one the server actually answered with a 4xx/5xx — the former is
// what the connection banner is for; the latter is a normal API error, handled by the toast
// below as before. ERR_CANCELED (React Query's own abort-on-unmount/refetch) is excluded —
// that's not a connectivity problem.
function isConnectivityFailure(error: AxiosError): boolean {
  return !error.response && error.code !== "ERR_CANCELED";
}

export function applyErrorInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => {
      useConnectionStore.getState().setServerUnreachable(false);
      return response;
    },
    (error: AxiosError<ErrorResponse>) => {
      if (isConnectivityFailure(error)) {
        useConnectionStore.getState().setServerUnreachable(true);
        return Promise.reject(error);
      }

      if (error.config?._skipErrorNotification) {
        return Promise.reject(error);
      }

      const problemDetails = error.response?.data?.data as
        ProblemDetails | string | undefined;
      const description =
        typeof problemDetails === "string"
          ? problemDetails
          : (problemDetails?.innerException ??
            problemDetails?.detail ??
            error.response?.data?.message ??
            error.message ??
            "An unexpected error occurred.");
      const message =
        typeof problemDetails === "string"
          ? getStatusTitle(error.response?.status)
          : (problemDetails?.title ?? getStatusTitle(error.response?.status));

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
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 422:
      return "Validation Error";
    case 500:
      return "Server Error";
    default:
      return "Request Failed";
  }
}
