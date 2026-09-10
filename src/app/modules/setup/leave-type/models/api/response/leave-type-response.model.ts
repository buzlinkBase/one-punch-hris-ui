export interface LeaveTypeResponse {
  id: string;
  // Identification
  code: string;
  category?: string;
  description: string;
  legalBasis: string;
  remarks: string;
  // Pay & Source
  paySource: string;
  employerAdvancesPayment: boolean;
  // Accrual
  accrualBasis: string;
  credits: number;
  accrualRate: number;
  maxAccrualBalance?: number | null;
  proRateFirstYear: boolean;
  leaveReset: string;
  // Eligibility
  minServiceMonths: number;
  genderRestriction: string;
  requiresApproval: boolean;
  requiresSupportingDocument: boolean;
  // Application Rules
  allowHalfDay: boolean;
  allowPartial: boolean;
  allowNegativeBalance: boolean;
  requiresCredits: boolean;
  maxDaysPerYear?: number | null;
  maxConsecutiveDays?: number | null;
  // Carry-Over
  carryOverType: string;
  carryOverMaxDays: number;
  carryOverExpiryMonths?: number | null;
  // Cash Conversion
  convertToCash: boolean;
  cashConversionRate: number;
  maxCashConversionDays?: number | null;
  // Statutory
  isStatutory: boolean;
}
