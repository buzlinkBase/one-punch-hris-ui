import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";

/** An impersonated session as AuthApi hands it over after the one-time code is redeemed. */
export interface ImpersonationSessionResponse {
  accessToken: string;
  /** ISO time the session hard-ends; there is no refresh. */
  expiry: string;
  sessionId: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  tenants: TenantSummary[];
  operatorEmail: string;
}
