export interface CreateBiometricDevice {
  sn: string;
  description: string;
  branchId?: string;
  clientId?: string;
  areaId?: string;
  status: string;
}
