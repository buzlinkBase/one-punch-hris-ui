import { z } from "zod";

export const overtimeApplicationFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  otDate: z.string().min(1, "OT date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  remarks: z.string(),
});

export type OvertimeApplicationFormValues = z.infer<
  typeof overtimeApplicationFormSchema
>;
