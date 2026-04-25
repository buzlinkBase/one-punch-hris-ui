import type { HolidayType } from '../response/holiday-response.model';

export interface CreateHoliday {
  name: string;
  date: string;
  type: HolidayType;
  status: string;
}
