import { z } from "zod";

export const payrollSettingsFormSchema = z.object({
  id: z.string().optional(),
  fiscalYearStartMonth: z.number().min(1).max(12),
  thirteenthMonthExemptionCeiling: z.number().min(0),
});

export type PayrollSettingsFormValues = z.infer<
  typeof payrollSettingsFormSchema
>;
