export interface DependentResponse {
  id: string;
  employeeId: string;
  fullName: string;
  relationship: string;
  gender: string;
  dob: string;
}

export interface EducationResponse {
  id: string;
  employeeId: string;
  schoolName: string;
  yearGraduated: number;
}

export interface SkillResponse {
  id: string;
  employeeId: string;
  name: string;
  level: number;
}

export interface DocRecordResponse {
  id: string;
  employeeId: string;
  recordType: string;
  description: string;
  file: string;
}

export interface EmploymentHistoryResponse {
  id: string;
  employeeId: string;
  companyName: string;
  position: string;
  fromDate: string;
  toDate: string;
}

export interface AssignAssetResponse {
  id: string;
  employeeId: string;
  assetType: string;
  assetDescription: string;
  model: string;
  brand: string;
  serialNo: string;
  qty: number;
  issuanceDate: string;
  returnedDate?: string;
  status: string;
  remarks: string;
  file: string;
}
