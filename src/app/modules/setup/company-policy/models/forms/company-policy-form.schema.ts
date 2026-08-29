import { z } from "zod";

export const companyPolicyFormSchema = z.object({
  otInclusionPolicy: z.string().min(1, "Required"),
  otEligibility: z.string().min(1, "Required"),
  isHalfDayLateOn: z.boolean(),
  halfDayLateThresholdMinutes: z.number().min(0, "Must be 0 or greater"),
  isWholeDayLateOn: z.boolean(),
  wholeDayLateThresholdMinutes: z.number().min(0, "Must be 0 or greater"),
  nightDiffThreshold: z.number().min(0, "Must be 0 or greater"),
  attFillLimit: z.string().min(1, "Required"),
  holidayTimeBasis: z.string().min(1, "Required"),
  isHolPlusReg: z.boolean(),
  timeInAllowance: z.number(),
  doublePunchGap: z.number().min(0, "Must be 0 or greater"),
  checkAfterHoliday: z.boolean(),
  waivePriorDayRequirement: z.boolean(),
  crossMonthStatutoryCreditPolicy: z.string().min(1, "Required"),
  wTaxCrossMonthCreditPolicy: z.string().min(1, "Required"),
  treatNdotAsNdOnly: z.boolean(),
});

export type CompanyPolicyFormValues = z.infer<typeof companyPolicyFormSchema>;
