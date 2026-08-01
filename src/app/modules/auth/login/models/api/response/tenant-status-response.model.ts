export interface TenantStatusResponse {
  tenantId: string;
  status: string;
  isReady: boolean;
  hrDbStatus: string | null;
  hrDbReady: boolean;
}
