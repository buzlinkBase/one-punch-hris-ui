export interface CreateFixedTimeShiftRequest {
  shiftName: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  withAMBreak: string;
  amStartTime: string;
  amEndTime: string;
  withLunchBreak: string;
  lunchStartTime: string;
  lunchEndTime: string;
  withPMBreak: string;
  pmStartTime: string;
  pmEndTime: string;
  gracePeriodMinutes: number;
  breakDurationMinutes: number;
  withOT: boolean;
  otRequireTimeIn: boolean;
  otStart: string;
  overTimeThreshold: number;
  minimumWorkMinutes: number;
  maxWorkingMinutes: number;
}

export interface CreateSplitTimeShiftRequest {
  shiftName: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  withAMBreak: string;
  amStartTime: string;
  amEndTime: string;
  withLunchBreak: string;
  lunchStartTime: string;
  lunchEndTime: string;
  withPMBreak: string;
  pmStartTime: string;
  pmEndTime: string;
  gracePeriodMinutes: number;
  breakDurationMinutes: number;
  withOT: boolean;
  otRequireTimeIn: boolean;
  otStart: string;
  overTimeThreshold: number;
  minimumWorkMinutes: number;
  maxWorkingMinutes: number;
}
