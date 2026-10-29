export interface ApplyScheduleGridResult {
  // Null when the save only cleared days (nothing new to undo).
  batchCode: string | null;
  saved: number;
  cleared: number;
}
