import { z } from "zod";

const cutoffModelSchema = z.object({
  day: z.number().min(1, "Min 1").max(31, "Max 31"),
  isEndOfMonth: z.boolean(),
  label: z.string(),
});

export const payrollGroupFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  payrollFrequency: z.enum(["DAILY", "WEEKLY", "SEMI_MONTHLY", "MONTHLY"]),
  statutoryDeductionSchedule: z.enum([
    "PerPayroll",
    "FirstHalfMonth",
    "SecondHalfMonth",
  ]),
  cutoffDays: z.array(cutoffModelSchema).optional(),
  status: z.string().min(1, "Status is required"),
});

export type PayrollGroupFormValues = z.infer<typeof payrollGroupFormSchema>;
