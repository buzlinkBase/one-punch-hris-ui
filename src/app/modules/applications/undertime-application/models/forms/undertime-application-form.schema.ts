import { z } from "zod";

export const undertimeApplicationFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  payrollDate: z.string().min(1, "Date is required"),
  utMinutes: z.number({ error: "Must be a number" }).min(0),
  remarks: z.string().min(1, "Reason is required"),
});

export type UndertimeApplicationFormValues = z.infer<
  typeof undertimeApplicationFormSchema
>;
