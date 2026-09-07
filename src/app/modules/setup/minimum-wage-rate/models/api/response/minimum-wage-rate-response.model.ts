export interface MinimumWageRateResponse {
  id: string;
  regionCode: string;
  regionName: string;
  dailyRate: number;
  effectiveDate: string;
  wageOrderNo?: string | null;
}
