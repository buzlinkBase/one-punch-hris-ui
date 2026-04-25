import type { CreateHoliday } from './create-holiday.model';

export interface UpdateHoliday extends CreateHoliday {
  id: string;
}
