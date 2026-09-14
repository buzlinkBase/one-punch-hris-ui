import type { TenantSummary } from "./tenant-summary.model";

export interface RefreshResponse {
  accessToken: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  tenants: TenantSummary[];
}
