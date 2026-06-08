export interface CreateAssignAsset {
  employeeId: string;
  assetType: string;
  assetDescription: string;
  model: string;
  brand: string;
  serialNo: string;
  qty: number;
  issuanceDate: string;
  returnedDate: string | null;
  remarks: string;
  file: string;
}
