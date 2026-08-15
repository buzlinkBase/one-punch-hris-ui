import { z } from "zod";

export const leaveApplicationFormSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    leaveId: z.string().min(1, "Leave type is required"),
    mode: z.enum(["singleday", "multiday", "partial"]),
    leaveDate: z.string().optional(),
    dayFraction: z.enum(["fullday", "am", "pm"]).optional(),
    leaveDateFrom: z.string().optional(),
    leaveDateTo: z.string().optional(),
    partialMode: z.enum(["timerange", "hours"]).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    totalHours: z.number().optional(),
    payType: z.string().min(1, "Pay type is required"),
    applicationRemarks: z.string().optional(),
    supportingDocumentUrl: z.string().optional(),
    approvalStatus: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "multiday") {
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
    } else {
      if (!data.leaveDate) {
        ctx.addIssue({
          path: ["leaveDate"],
          code: z.ZodIssueCode.custom,
          message: "Leave date is required",
        });
      }
    }
    if (data.mode === "singleday" && !data.dayFraction) {
      ctx.addIssue({
        path: ["dayFraction"],
        code: z.ZodIssueCode.custom,
        message: "Please select a day fraction",
      });
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

export type LeaveApplicationFormValues = z.infer<
  typeof leaveApplicationFormSchema
>;
export type LeaveMode = LeaveApplicationFormValues["mode"];
