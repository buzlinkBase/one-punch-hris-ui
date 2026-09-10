export interface DeductionResponse {
  id: string;
  code: string;
  name: string;
  deductionTypeId: string;
  amount: number;
  status: string;
  allowEmployeeFiling: boolean;
}
