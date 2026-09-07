import type {
  HolidayType,
  HolidayWorkType,
  DayOfWeekName,
} from "../request/create-holiday.model";

export type { HolidayType, HolidayWorkType, DayOfWeekName };

export interface HolidayResponse {
  id: string;
  description: string;
  holidayType?: HolidayType;
  holType?: HolidayType;
  workType: HolidayWorkType;
  holDate: string;
  holYear: number;
  isRecuring: boolean;
  weekOfMonth?: number | null;
  dayOfWeek?: DayOfWeekName | null;
  isPaid: boolean;
  areaId?: string | null;
  areaName?: string | null;
  status: string;
}
