export interface CreateMinimumWageRate {
  regionCode: string;
  regionName: string;
  dailyRate: number;
  effectiveDate: string;
  wageOrderNo?: string | null;
}
