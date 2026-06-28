export type HolidayType = 'SPECIAL' | 'LEGAL';
export type HolidayWorkType = 'Working' | 'NonWorking';

export interface CreateHoliday {
  description: string;
  holType: HolidayType;
  workType: HolidayWorkType;
  holDate: string;
  isRecuring: boolean;
  isPaid: boolean;
  areaId?: string | null;
  status: string;
}
