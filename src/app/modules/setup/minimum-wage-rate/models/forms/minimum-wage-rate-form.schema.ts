import { z } from "zod";

export const minimumWageRateFormSchema = z.object({
  regionCode: z.string().min(1, "Region is required"),
  regionName: z.string().min(1, "Region is required"),
  dailyRate: z
    .number({ error: "Daily rate is required" })
    .min(0, "Daily rate must be 0 or more"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  wageOrderNo: z.string().optional(),
  wageOrderClass: z.string().optional(),
});

export type MinimumWageRateFormValues = z.infer<
  typeof minimumWageRateFormSchema
>;
