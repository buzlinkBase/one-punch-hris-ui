export interface BiometricDeviceModel {
  id: string;
  sn: string;
  deviceName: string;
  description: string;
  macAddress: string;
  ipAddress: string;
  platform: string;
  oemVendor: string;
  branchId?: string;
  clientId?: string;
  departmentId?: string;
  operationAreaId?: string;
  status: string;
}
