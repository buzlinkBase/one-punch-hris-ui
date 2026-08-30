import { z } from "zod";

const timeSpan = z.string().min(1, "Time is required");
const optionalTimeSpan = z.string().nullable().optional();

export const flexiTimeShiftFormSchema = z.object({
  shiftName: z.string().min(1, "Shift name is required"),
  startTime: timeSpan,
  endTime: timeSpan,
  unpaidLunchBreak: z.boolean(),
  lunchStartTime: optionalTimeSpan,
  lunchEndTime: optionalTimeSpan,
  breakDurationMinutes: z.number().min(0),
  minimumWorkMinutes: z.number().min(0),
  maxWorkingMinutes: z.number().min(0),
  withOT: z.boolean(),
  overTimeThreshold: z.number().min(0),
  // Null or 0 = no limit on OT hours creditable for a day on this shift.
  maxOvertimeHours: z.number().min(0).nullable().optional(),
});

export type FlexiTimeShiftFormValues = z.infer<typeof flexiTimeShiftFormSchema>;
