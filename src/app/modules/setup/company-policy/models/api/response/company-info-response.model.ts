export interface CompanyInfoResponse {
  id?: string;
  code?: string;
  description: string;
  shortName?: string;
  address?: string;
  contact?: string;
  email?: string;
  tin?: string;
  rdoCode?: string;
  sssNumber?: string;
  philHealthNumber?: string;
  pagIbigNumber?: string;
  authorizedSignatoryName?: string;
  authorizedSignatoryTitle?: string;
  industryCode?: string;
  subIndustryCode?: string;
  businessType?: string;
  companySize?: string;
  registeredName?: string;
  website?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  country?: string;
  secondaryPhone?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactPhone?: string;
  payrollContactName?: string;
  payrollContactEmail?: string;
  payrollContactPhone?: string;
  employerType?: string;
  isWithholdingAgent?: boolean;
  atcCode?: string;
  tinBranchCode?: string;
  sssBranchCode?: string;
  philHealthBranchCode?: string;
  pagIbigBranchCode?: string;
  secDtiNumber?: string;
  registrationDate?: string | null;
  businessPermitNo?: string;
  businessPermitExpiry?: string | null;
  payslipFooter?: string;
  showLetterhead?: boolean;
  /** "Off" (free text, the default) or "Auto". */
  employeeIdMode?: string;
  employeeIdPrefix?: string;
  employeeIdPadding?: number;
  employeeIdIncludeYear?: boolean;
  /** The next number the counter will hand out (read-only). */
  nextEmployeeNo?: number;
  timeZone?: string;
  currency?: string;
  /** Comma-separated weekday names; empty on companies saved before this existed. */
  workWeekRestDays?: string;
  /** A short-lived link to the logo; empty when there's none. */
  logoUrl?: string;
}
