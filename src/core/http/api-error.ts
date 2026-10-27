import { isAxiosError } from "axios";
import type {
  ErrorResponse,
  ProblemDetails,
} from "@/shared/types/api-response.model";

// One place that knows how a failed request looks, so components and hooks read errors without
// importing axios themselves.

/** The HTTP status the server answered with, or undefined when it never answered. */
export function httpStatusOf(err: unknown): number | undefined {
  return isAxiosError(err) ? err.response?.status : undefined;
}

/** The failed response's body, typed by the caller; undefined for a non-HTTP error. */
export function apiErrorBody<T = ErrorResponse>(err: unknown): T | undefined {
  return isAxiosError(err) ? (err.response?.data as T | undefined) : undefined;
}

/**
 * The server's own explanation of a failed request -- ProblemDetails' `detail`, or the plain
 * string some endpoints send as `data` -- or `fallback` when there's none (network error,
 * non-HTTP error, or an empty body).
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const data = apiErrorBody(err)?.data as ProblemDetails | string | undefined;
  if (typeof data === "string" && data) return data;
  if (typeof data === "object" && data?.detail) return data.detail;
  return fallback;
}
