import type { TenantSummary } from "./tenant-summary.model";

export interface CreateTenantResponse {
  accessToken: string;
  tenants: TenantSummary[];
  email: string;
  name: string;
  role: string;
}
