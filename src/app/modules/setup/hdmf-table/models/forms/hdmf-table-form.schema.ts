import { z } from "zod";

const num = z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0");

export const hdmfTableFormSchema = z.object({
  effectiveDate: z.string().min(1, "Effectivity date is required"),
  minSalaryBase: num,
  maxSalaryBase: num,
  employeeRate: num,
  employerRate: num,
  employeeShare: num,
  employerShare: num,
  remarks: z.string(),
});

export type HdmfTableFormValues = z.infer<typeof hdmfTableFormSchema>;
