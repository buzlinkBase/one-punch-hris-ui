export interface CreateOtherIncome {
  code: string;
  name: string;
  incomeClass: string;
  incomeTypeId?: string;
  isTaxable: boolean;
  // Flags this category for BIR Form 1601-C Line 16B (Minimum Wage Earner premium pay) —
  // has no effect on how it's taxed/calculated, just how the 1601-C report classifies it.
  isHazardPay: boolean;
  status: string;
}
