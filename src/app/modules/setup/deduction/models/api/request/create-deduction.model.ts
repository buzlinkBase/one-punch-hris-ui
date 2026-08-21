export interface CreateDeduction {
  code: string;
  name: string;
  deductionTypeId: string;
  amount?: number;
  status: string;
}
