import type { TenantSummary } from "./tenant-summary.model";

export interface LoginResponse {
  errorMessage: string;
  accessToken: string;
  tenants: TenantSummary[];
  expiry: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}
