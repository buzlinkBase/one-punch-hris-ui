export interface AnnualTaxTableResponse {
  id: string;
  effectiveDate: string;
  rangeFrom: number;
  rangeTo: number;
  baseTaxDue: number;
  addOnPercentage: number;
}
