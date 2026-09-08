// Mirrors backend YearLock — one row per calendar year that has ever been locked (by posting a
// Year-End Tax Adjustment for it). See YearLockService.
export interface YearLockResponse {
  id: string;
  year: number;
  isLocked: boolean;
  lockedAt?: string | null;
  reopenedAt?: string | null;
}
