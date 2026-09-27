import { z } from "zod";

export const overtimeApplicationFormSchema = z
  .object({
    mode: z.enum(["datetime", "hours"]),
    employeeId: z.string().min(1, "Employee is required"),
    otDate: z.string().min(1, "OT date is required"),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    manualOTMinutes: z
      .number({ error: "Must be a number" })
      .min(0.25, { error: "Minimum 15 minutes" })
      .optional(),
    remarks: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "datetime") {
      if (!val.startTime)
        ctx.addIssue({
          code: "custom",
          path: ["startTime"],
          message: "Start time is required",
        });
      if (!val.endTime)
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "End time is required",
        });
    } else {
      if (val.manualOTMinutes === undefined || val.manualOTMinutes === null)
        ctx.addIssue({
          code: "custom",
          path: ["manualOTMinutes"],
          message: "OT minutes is required",
        });
    }
  });

export type OvertimeApplicationFormValues = z.infer<
  typeof overtimeApplicationFormSchema
>;
