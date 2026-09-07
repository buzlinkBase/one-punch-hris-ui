export type HolidayType = "SPECIAL" | "LEGAL";
export type HolidayWorkType = "Working" | "NonWorking";
export type DayOfWeekName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface CreateHoliday {
  description: string;
  holType: HolidayType;
  workType: HolidayWorkType;
  holDate: string;
  isRecuring: boolean;
  // When set together with isRecuring = true, the holiday recurs on the Nth (or last)
  // dayOfWeek of holDate's month every year instead of holDate's fixed day (e.g. National
  // Heroes Day = "last Monday of August"). weekOfMonth: 1-4 = first..fourth occurrence, 5 =
  // last occurrence in the month. Leave both unset for the existing fixed month/day
  // recurrence.
  weekOfMonth?: number | null;
  dayOfWeek?: DayOfWeekName | null;
  isPaid: boolean;
  areaId?: string | null;
  status: string;
}
