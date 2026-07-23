import { z } from "zod";

export const dayOffEntrySchema = z.object({
  fromDate: z.string().min(1, "Prior day-off from is required"),
  toDate: z.string().min(1, "Prior day-off to is required"),
  newDate: z.string().min(1, "New day-off date is required"),
});

export const changeRestDayBatchSchema = z.object({
  employeeIds: z.array(z.string()).min(1, "Select at least one employee"),
  entries: z
    .array(dayOffEntrySchema)
    .min(1, "Add at least one day-off change entry"),
});

export type DayOffEntry = z.infer<typeof dayOffEntrySchema>;
export type ChangeRestDayBatchValues = z.infer<typeof changeRestDayBatchSchema>;
