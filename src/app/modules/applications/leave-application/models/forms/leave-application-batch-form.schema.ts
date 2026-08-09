import { z } from "zod";

const batchLeaveEntrySchema = z.object({
  employeeId: z.string().min(1, { message: "Required" }),
  leaveId: z.string().min(1, { message: "Required" }),
  dayType: z.string().min(1, { message: "Required" }),
  payType: z.string().min(1, { message: "Required" }),
  applicationRemarks: z.string().optional(),
});

export const batchLeaveFormSchema = z.object({
  leaveDateFrom: z.string().min(1, { message: "Start date is required" }),
  leaveDateTo: z.string().min(1, { message: "End date is required" }),
  entries: z
    .array(batchLeaveEntrySchema)
    .min(1, { message: "Add at least one entry" }),
});

export type BatchLeaveFormValues = z.infer<typeof batchLeaveFormSchema>;
