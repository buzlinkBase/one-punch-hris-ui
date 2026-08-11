import { z } from "zod";

export const travelOrderFormSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    mode: z.enum(["timerange", "hours"]),
    timeShiftId: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    totalHours: z.number().optional(),
    destination: z.string().min(1, "Destination is required"),
    classification: z.string().min(1, "Classification is required"),
    purpose: z.string().min(1, "Purpose is required"),
    cost: z.number({ error: "Cost must be a number" }).min(0),
    applicationRemarks: z.string().optional(),
    approvalStatus: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "timerange") {
      if (!data.startTime) {
        ctx.addIssue({
          code: "custom",
          path: ["startTime"],
          message: "Start time is required",
        });
      }
      if (!data.endTime) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "End time is required",
        });
      }
    }
    if (data.mode === "hours") {
      if (data.totalHours == null || data.totalHours <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["totalHours"],
          message: "Total hours is required",
        });
      }
    }
  });

export type TravelOrderFormValues = z.infer<typeof travelOrderFormSchema>;
