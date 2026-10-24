import { z } from "zod";

export const payrollSettingsFormSchema = z.object({
  id: z.string().optional(),
  fiscalYearStartMonth: z.number().min(1).max(12),
  thirteenthMonthExemptionCeiling: z.number().min(0),
  largeTaxCollectionWarningMultiplier: z.number().min(0),
  portalShowThirteenthMonth: z.boolean(),
  portalShowCashBond: z.boolean(),
  portalShowUniformAllowance: z.boolean(),
  portalShowAnnouncements: z.boolean(),
  portalShowCoworkers: z.boolean(),
  portalShowDtr: z.boolean(),
  portalShowIncompletePunches: z.boolean(),
  portalShowRawAttendance: z.boolean(),
  portalShowShiftSchedule: z.boolean(),
  portalShowPayslips: z.boolean(),
  portalShowLeaveCredits: z.boolean(),
  portalShowDeductions: z.boolean(),
  portalShowLeaveApplications: z.boolean(),
  portalShowOvertime: z.boolean(),
  portalShowOfficialBusiness: z.boolean(),
  portalShowPassSlip: z.boolean(),
  portalShowLoanApplications: z.boolean(),
});

export type PayrollSettingsFormValues = z.infer<
  typeof payrollSettingsFormSchema
>;
