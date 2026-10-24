import { z } from "zod";

export const payrollSettingsFormSchema = z.object({
  id: z.string().optional(),
  fiscalYearStartMonth: z.number().min(1).max(12),
  thirteenthMonthExemptionCeiling: z.number().min(0),
  largeTaxCollectionWarningMultiplier: z.number().min(0),
  portalShowThirteenthMonth: z.boolean(),
  portalShowCashBond: z.boolean(),
  portalShowUniformAllowance: z.boolean(),
});

export type PayrollSettingsFormValues = z.infer<
  typeof payrollSettingsFormSchema
>;
