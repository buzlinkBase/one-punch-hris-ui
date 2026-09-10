export interface TenantSummary {
  tenantId: string;
  name: string;
  state: string;
  roles: string[];
  permissions: string[];
  hrDbStatus: string | null;
  hrDbReady: boolean;
}
