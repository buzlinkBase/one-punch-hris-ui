import type {
  HolidayType,
  HolidayWorkType,
} from "../request/create-holiday.model";

export type { HolidayType, HolidayWorkType };

export interface HolidayResponse {
  id: string;
  description: string;
  holidayType?: HolidayType;
  holType?: HolidayType;
  workType: HolidayWorkType;
  holDate: string;
  holYear: number;
  isRecuring: boolean;
  isPaid: boolean;
  areaId?: string | null;
  areaName?: string | null;
  status: string;
}
