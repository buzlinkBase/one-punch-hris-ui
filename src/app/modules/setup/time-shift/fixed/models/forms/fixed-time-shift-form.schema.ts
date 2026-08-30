import { z } from "zod";

const timeSpan = z.string().min(1, "Time is required");
const optionalTimeSpan = z.string().nullable().optional();

export const fixedTimeShiftFormSchema = z.object({
  shiftName: z.string().min(1, "Shift name is required"),
  startTime: timeSpan,
  endTime: timeSpan,
  gracePeriodMinutes: z.number().min(0),
  withLunchBreak: z.enum(["NONE", "UNPAID_BREAK", "PAID_BREAK"]),
  lunchStartTime: optionalTimeSpan,
  lunchEndTime: optionalTimeSpan,
  breakDurationMinutes: z.number().min(0),
  withAMBreak: z.boolean(),
  amStartTime: optionalTimeSpan,
  amEndTime: optionalTimeSpan,
  withPMBreak: z.boolean(),
  pmStartTime: optionalTimeSpan,
  pmEndTime: optionalTimeSpan,
  maxWorkingMinutes: z.number().min(0),
  minimumWorkMinutes: z.number().min(0),
  withOT: z.boolean(),
  otRequireTimeIn: z.boolean(),
  otStart: z.string(),
  overTimeThreshold: z.number().min(0),
  // Null or 0 = no limit on OT hours creditable for a day on this shift.
  maxOvertimeHours: z.number().min(0).nullable().optional(),
});

export type FixedTimeShiftFormValues = z.infer<typeof fixedTimeShiftFormSchema>;
