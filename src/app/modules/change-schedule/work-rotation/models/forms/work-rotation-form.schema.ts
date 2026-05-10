import { z } from "zod";

export const workRotationFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  timeShiftId: z.string().min(1, "Time shift is required"),
  payrollDate: z.string().min(1, "Payroll date is required"),
});

export type WorkRotationFormValues = z.infer<typeof workRotationFormSchema>;
