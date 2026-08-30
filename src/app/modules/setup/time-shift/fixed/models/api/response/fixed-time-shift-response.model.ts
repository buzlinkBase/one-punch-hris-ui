import type {
  BreakMode,
  TimeShiftType,
} from "../request/create-fixed-time-shift.model";

export interface FixedTimeShiftResponse {
  id: string;
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
  maxOvertimeHours: number | null;
  minimumWorkMinutes: number;
  maxWorkingMinutes: number;
}
