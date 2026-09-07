export interface CreateMinimumWageRate {
  regionCode: string;
  regionName: string;
  dailyRate: number;
  effectiveDate: string;
  wageOrderNo?: string | null;
  // Sector/class this rate applies to within the region (e.g. "Non-Agriculture",
  // "Retail/Service establishments employing 10 workers or less") — a single wage order
  // often sets different rates per class. Leave blank if the region's wage order doesn't
  // split by class.
  wageOrderClass?: string | null;
}
