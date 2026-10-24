import { z } from "zod";

export const workRotationFormSchema = z.object({
  timeShiftId: z.string().min(1, "Time shift is required"),
  payrollDate: z.string().min(1, "Payroll date is required"),
  operationAreaId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
});

export type WorkRotationFormValues = z.infer<typeof workRotationFormSchema>;
