import type { TenantSummary } from "./tenant-summary.model";

export interface AcceptInvitationResponse {
  accessToken: string;
  tenants: TenantSummary[];
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}
