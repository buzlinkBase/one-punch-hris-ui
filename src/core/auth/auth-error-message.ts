import axios from "axios";
import type {
  ApiResponse,
  ProblemDetails,
} from "@/shared/types/api-response.model";

type AuthErrorBody = ApiResponse<
  { errorMessage?: string } & Partial<ProblemDetails>
>;

/**
 * The reason a sign-in / sign-up / password request failed, for its toast. Normally the API's
 * own errorMessage; after too many attempts (429) its "please wait" detail instead, so the user
 * isn't told their password is wrong when they're only being slowed down.
 */
export function authErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return "An unexpected error occurred.";
  const data = (err.response?.data as AuthErrorBody | undefined)?.data;
  if (err.response?.status === 429) return data?.detail ?? fallback;
  return data?.errorMessage ?? fallback;
}
