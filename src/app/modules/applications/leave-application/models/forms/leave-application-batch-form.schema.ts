import { z } from "zod";

const batchLeaveEntrySchema = z.object({
  employeeId: z.string().min(1, { message: "Required" }),
  leaveId: z.string().min(1, { message: "Required" }),
  payType: z.string().min(1, { message: "Required" }),
  applicationRemarks: z.string().optional(),
});

export const batchLeaveFormSchema = z
  .object({
    mode: z.enum(["singleday", "multiday", "partial"]),
    leaveDate: z.string().optional(),
    dayFraction: z.enum(["fullday", "am", "pm"]).optional(),
    leaveDateFrom: z.string().optional(),
    leaveDateTo: z.string().optional(),
    partialMode: z.enum(["timerange", "hours"]).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    totalHours: z.number().optional(),
    entries: z
      .array(batchLeaveEntrySchema)
      .min(1, { message: "Add at least one entry" }),
  })
  .superRefine((data, ctx) => {
    if (data.mode !== "multiday") {
      if (!data.leaveDate) {
        ctx.addIssue({
          path: ["leaveDate"],
          code: z.ZodIssueCode.custom,
          message: "Leave date is required",
        });
      }
    } else {
      if (!data.leaveDateFrom) {
        ctx.addIssue({
          path: ["leaveDateFrom"],
          code: z.ZodIssueCode.custom,
          message: "Start date is required",
        });
      }
      if (!data.leaveDateTo) {
        ctx.addIssue({
          path: ["leaveDateTo"],
          code: z.ZodIssueCode.custom,
          message: "End date is required",
        });
      }
    }
    if (data.mode === "partial") {
      if (data.partialMode === "timerange" || !data.partialMode) {
        if (!data.startTime) {
          ctx.addIssue({
            path: ["startTime"],
            code: z.ZodIssueCode.custom,
            message: "Start time is required",
          });
        }
        if (!data.endTime) {
          ctx.addIssue({
            path: ["endTime"],
            code: z.ZodIssueCode.custom,
            message: "End time is required",
          });
        }
      } else if (data.partialMode === "hours") {
        if (!data.totalHours || data.totalHours <= 0) {
          ctx.addIssue({
            path: ["totalHours"],
            code: z.ZodIssueCode.custom,
            message: "Total hours must be greater than 0",
          });
        }
      }
    }
  });

export type BatchLeaveFormValues = z.infer<typeof batchLeaveFormSchema>;
