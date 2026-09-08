import { z } from "zod";

const num = z.number({ error: "Must be a number" }).min(0, "Must be ≥ 0");

export const phicTableFormSchema = z.object({
  minSalaryBase: num,
  maxSalaryBase: num,
  premiumRate: num,
  employeeShare: num,
  employerShare: num,
  remarks: z.string(),
});

export type PhicTableFormValues = z.infer<typeof phicTableFormSchema>;
