import { z } from "zod";

export const leaveBalanceFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  leaveId: z.string().min(1, "Leave type is required"),
  year: z.number().min(2000, "Year is required"),
  newBalance: z.coerce.number().min(0, "Balance cannot be negative"),
  particulars: z.string().min(1, "Particulars is required for the audit trail"),
});

export type LeaveBalanceFormValues = z.infer<typeof leaveBalanceFormSchema>;
