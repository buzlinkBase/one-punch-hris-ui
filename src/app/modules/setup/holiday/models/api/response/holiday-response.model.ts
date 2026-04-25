export type HolidayType = 'Regular' | 'Special Non-Working' | 'Special Working';

export interface HolidayResponse {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  status: string;
}
