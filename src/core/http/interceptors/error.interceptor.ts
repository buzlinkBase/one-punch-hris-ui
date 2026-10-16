import type { AxiosInstance, AxiosError } from "axios";
import { getNotify } from "@/shared/utils/notify";
import type {
  ErrorResponse,
  ProblemDetails,
} from "@/shared/types/api-response.model";
import { useConnectionStore } from "@/core/stores/connection.store";
import { serviceKeyOf } from "../service-registry";
import { usePlanRestrictionStore } from "@/core/stores/plan-restriction.store";
import { queryClient } from "@/core/query-client";
import { SUBSCRIPTION_PROBLEM_TYPES } from "@/shared/constants/entitlement-keys.const";
import { toPlanRestriction } from "./plan-restriction";

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
      useConnectionStore
        .getState()
        .markReachable(serviceKeyOf(response.config.url));
      return response;
    },
    (error: AxiosError<ErrorResponse>) => {
      const service = serviceKeyOf(error.config?.url);
      if (isConnectivityFailure(error)) {
        useConnectionStore.getState().markUnreachable(service);
        return Promise.reject(error);
      }
      // Any answer at all, even a 4xx/5xx, means that service is reachable again.
      if (error.response) useConnectionStore.getState().markReachable(service);

      // A subscription refusal (feature not in the plan, limit reached, read-only, locked): the
      // cached entitlements are evidently stale, and the user needs an upgrade prompt rather
      // than a generic error toast. A locked-out member gets the lock screen instead, once the
      // entitlements refetch -- no prompt per request.
      const restriction = toPlanRestriction(error.response?.data);
      if (restriction) {
        void queryClient.invalidateQueries({ queryKey: ["subscription"] });
        const locked = restriction.type === SUBSCRIPTION_PROBLEM_TYPES.LOCKED;
        if (!locked && !error.config?._skipErrorNotification) {
          usePlanRestrictionStore.getState().show(restriction);
        }
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
    case 429:
      return "Too Many Requests";
    case 500:
      return "Server Error";
    default:
      return "Request Failed";
  }
}
