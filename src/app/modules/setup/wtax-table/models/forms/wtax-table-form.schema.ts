import { z } from "zod";

const num = z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0");

export const wtaxTableFormSchema = z.object({
  payrollType: z.string().min(1, "Payroll type is required"),
  rangeFrom: num,
  rangeTo: num,
  baseTaxDue: num,
  addOnPercentage: num,
});

export type WtaxTableFormValues = z.infer<typeof wtaxTableFormSchema>;
