export interface BiometricDeviceModel {
  id: string;
  sn: string;
  deviceName: string;
  description: string;
  platform: string;
  oemVendor: string;
  fwVersion: string;
  pushVersion: string;
  regDeviceType?: string | null;
  languageCode: number;
  branchId?: string;
  clientId?: string;
  departmentId?: string;
  operationAreaId?: string;
  state: string;
  status: string;
}
