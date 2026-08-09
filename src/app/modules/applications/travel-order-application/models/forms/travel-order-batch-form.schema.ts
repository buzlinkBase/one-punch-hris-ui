import { z } from "zod";

const batchTravelOrderEntrySchema = z.object({
  employeeId: z.string().min(1, { message: "Required" }),
  applicationRemarks: z.string().optional(),
});

export const batchTravelOrderFormSchema = z
  .object({
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    mode: z.enum(["timerange", "hours"]),
    timeShiftId: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    totalHours: z.number().optional(),
    destination: z.string().min(1, { message: "Destination is required" }),
    classification: z
      .string()
      .min(1, { message: "Classification is required" }),
    purpose: z.string().min(1, { message: "Purpose is required" }),
    entries: z
      .array(batchTravelOrderEntrySchema)
      .min(1, { message: "Add at least one entry" }),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "timerange") {
      if (!data.startTime)
        ctx.addIssue({
          code: "custom",
          path: ["startTime"],
          message: "Start time is required",
        });
      if (!data.endTime)
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "End time is required",
        });
    } else {
      if (data.totalHours == null || data.totalHours <= 0)
        ctx.addIssue({
          code: "custom",
          path: ["totalHours"],
          message: "Total hours is required",
        });
    }
  });

export type BatchTravelOrderFormValues = z.infer<
  typeof batchTravelOrderFormSchema
>;
