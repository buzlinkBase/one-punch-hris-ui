export interface OtherIncomeResponse {
  id: string;
  code: string;
  name: string;
  incomeClass: string;
  incomeTypeId?: string;
  isTaxable: boolean;
  isHazardPay: boolean;
  status: string;
}
