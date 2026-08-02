import { z } from "zod";

export const leaveTypeFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  category: z.string().optional(),
  description: z.string().min(1, "Leave name is required"),
  credits: z
    .number({ error: "Credits must be a number" })
    .min(0, "Credits must be 0 or more"),
  paySource: z.string().min(1, "Pay source is required"),
  leaveReset: z.string().min(1, "Leave reset is required"),
  remarks: z.string(),
});

export type LeaveTypeFormValues = z.infer<typeof leaveTypeFormSchema>;
