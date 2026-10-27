import { z } from "zod";
import type { Dayjs } from "dayjs";

export const salaryAdjustmentFormSchema = z.object({
  employeeId: z
    .string({ error: "Select an employee" })
    .min(1, "Select an employee"),
  adjustmentType: z.number({ error: "Select a type" }),
  payrollDate: z.custom<Dayjs>((v) => !!v, "Select a payroll date"),
  amount: z.number({ error: "Enter an amount" }).min(0.01, "Enter an amount"),
  remarks: z.string().optional(),
});

export type SalaryAdjustmentFormValues = z.infer<
  typeof salaryAdjustmentFormSchema
>;
