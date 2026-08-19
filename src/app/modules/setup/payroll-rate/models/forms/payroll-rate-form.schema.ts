import { z } from "zod";

export const payrollRateFormSchema = z.object({
  type: z.string().min(1, "Rate type is required"),
  rate: z.number({ error: "Rate is required" }).min(0, "Must be 0 or greater"),
  remarks: z.number().default(0),
});

export type PayrollRateFormValues = z.infer<typeof payrollRateFormSchema>;
