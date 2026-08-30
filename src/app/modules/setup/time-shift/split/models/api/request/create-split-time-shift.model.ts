export type BreakMode = "NONE" | "UNPAID_BREAK" | "PAID_BREAK";
export type TimeShiftType = "FIXED" | "SPLIT" | "FLEXI";

export interface CreateSplitTimeShift {
  shiftName: string;
  shiftType: TimeShiftType;
  startTime: string;
  endTime: string;
  withAMBreak: BreakMode;
  amStartTime: string | null;
  amEndTime: string | null;
  withLunchBreak: BreakMode;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  withPMBreak: BreakMode;
  pmStartTime: string | null;
  pmEndTime: string | null;
  gracePeriodMinutes: number;
  breakDurationMinutes: number;
  withOT: boolean;
  otRequireTimeIn: boolean;
  otStart: string;
  overTimeThreshold: number;
  // Null or 0 = no limit on OT hours creditable for a day on this shift.
  maxOvertimeHours: number | null;
  minimumWorkMinutes: number;
  maxWorkingMinutes: number;
}
