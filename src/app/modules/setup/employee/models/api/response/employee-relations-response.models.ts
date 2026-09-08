export interface DependentResponse {
  id: string;
  employeeId: string;
  fullName: string;
  relationship: string;
  gender: string;
  dob: string;
}

// A newly-hired employee's previous employer's year-to-date figures (BIR Form 2316), folded
// into that year's Year-End Tax Annualization alongside this employer's own payroll. One row
// per employee per calendar year. See TaxAnnualizationPreview.hasPriorEmployerData.
export interface PriorEmployerTaxRecordResponse {
  id: string;
  employeeId: string;
  year: number;
  hasPriorEmployer: boolean;
  priorEmployerName?: string | null;
  grossIncomeYtd: number;
  nonTaxableYtd: number;
  statutoryDeductionsYtd: number;
  taxWithheldYtd: number;
}

// A company's own pre-system-cutover YTD payroll figures for an employee, for onboarding
// mid-year — distinct from PriorEmployerTaxRecordResponse (a genuinely different employer's
// BIR 2316). Same employer here, just history that lived in a prior payroll system.
// grossIncome/totalDeductions/netPay are computed server-side from the other fields and are
// read-only from the client's perspective.
export interface PayrollOpeningBalanceResponse {
  id: string;
  employeeId: string;
  year: number;
  basicPay: number;
  overtimePay: number;
  holidayPay: number;
  allowances: number;
  otherIncome: number;
  bonuses: number;
  grossIncome: number;
  nonTaxableIncome: number;
  sssContribution: number;
  philHealthContribution: number;
  pagIbigContribution: number;
  withholdingTax: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
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
