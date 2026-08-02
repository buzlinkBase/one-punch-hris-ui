import { z } from "zod";

export const leaveApplicationFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  leaveId: z.string().min(1, "Leave type is required"),
  leaveDateFrom: z.string().min(1, "Start date is required"),
  leaveDateTo: z.string().min(1, "End date is required"),
  dayType: z.string().min(1, "Day type is required"),
  applicationRemarks: z.string().optional(),
});

export type LeaveApplicationFormValues = z.infer<
  typeof leaveApplicationFormSchema
>;
