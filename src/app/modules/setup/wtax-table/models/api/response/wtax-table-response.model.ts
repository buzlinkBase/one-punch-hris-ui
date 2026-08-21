export interface WtaxTableResponse {
  id: string;
  effectiveDate: string;
  payrollType: string;
  rangeFrom: number;
  rangeTo: number;
  baseTaxDue: number;
  addOnPercentage: number;
}
