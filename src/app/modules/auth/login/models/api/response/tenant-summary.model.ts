export interface TenantSummary {
  tenantId: string;
  name: string;
  state: string;
  role: string;
  hrDbStatus: string | null;
  hrDbReady: boolean;
}
