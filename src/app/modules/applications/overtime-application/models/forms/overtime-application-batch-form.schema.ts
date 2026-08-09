import { z } from "zod";

const batchEntrySchema = z.object({
  employeeId: z.string().min(1, { message: "Required" }),
  mode: z.enum(["datetime", "hours"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  otHours: z
    .number({ error: "Required" })
    .min(0.25, { error: "Min 15 min" })
    .optional(),
  remarks: z.string(),
});

export const batchOvertimeFormSchema = z
  .object({
    otDate: z.string().min(1, { message: "OT date is required" }),
    entries: z
      .array(batchEntrySchema)
      .min(1, { message: "Add at least one entry" }),
  })
  .superRefine((val, ctx) => {
    val.entries.forEach((entry, i) => {
      if (entry.mode === "datetime") {
        if (!entry.startTime)
          ctx.addIssue({
            code: "custom",
            path: ["entries", i, "startTime"],
            message: "Required",
          });
        if (!entry.endTime)
          ctx.addIssue({
            code: "custom",
            path: ["entries", i, "endTime"],
            message: "Required",
          });
      } else {
        if (entry.otHours === undefined || entry.otHours === null)
          ctx.addIssue({
            code: "custom",
            path: ["entries", i, "otHours"],
            message: "Required",
          });
      }
    });
  });

export type BatchOvertimeFormValues = z.infer<typeof batchOvertimeFormSchema>;
