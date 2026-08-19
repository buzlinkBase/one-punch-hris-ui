export interface CreateAnnualTaxTable {
  effectiveDate: string;
  rangeFrom: number;
  rangeTo: number;
  baseTaxDue: number;
  addOnPercentage: number;
}
