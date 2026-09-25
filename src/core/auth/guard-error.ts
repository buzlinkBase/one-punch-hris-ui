import axios from "axios";
import type {
  ApiResponse,
  ProblemDetails,
} from "@/shared/types/api-response.model";

function problemDetailsOf(err: unknown): ProblemDetails | undefined {
  if (!axios.isAxiosError(err)) return undefined;
  return (err.response?.data as ApiResponse<ProblemDetails> | undefined)?.data;
}

/** Pulls the machine-readable GuardException `code` (e.g. "INVITATION_EMAIL_MISMATCH") out of a
 * failed request, if the backend attached one. Falls back to undefined for network errors,
 * non-GuardException failures, or older endpoints that don't send a code yet. */
export function guardCode(err: unknown): string | undefined {
  return problemDetailsOf(err)?.code;
}

/** The backend's human-readable `detail` for a failed request, or `fallback` when there isn't
 * one (network error, non-axios error, or a response without ProblemDetails). */
export function problemDetail(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return "An unexpected error occurred.";
  return problemDetailsOf(err)?.detail ?? fallback;
}
