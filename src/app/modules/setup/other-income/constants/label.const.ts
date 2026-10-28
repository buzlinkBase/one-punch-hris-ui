export const OTHER_INCOME_LABEL = {
  MODULE: "Other Income",
  LIST_TITLE: "Other Income",
  CREATE_TITLE: "Add Other Income",
  EDIT_TITLE: "Edit Other Income",
  CODE: "Code",
  NAME: "Name",
  INCOME_CLASS: "Income Class",
  INCOME_TYPE: "Income Type",
  IS_TAXABLE: "Taxable",
  STATUS: "Status",
};

export const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const INCOME_CLASS_OPTIONS = [
  { value: "Deminimis", label: "De Minimis" },
  { value: "Regular", label: "Regular" },
  { value: "Commission", label: "Commission" },
  { value: "SpecialBonus", label: "Special Bonus" },
  { value: "Reimbursement", label: "Reimbursement" },
  { value: "Others", label: "Others" },
];

export const INCOME_CLASS_LABEL: Record<string, string> = {
  Deminimis: "De Minimis",
  Regular: "Regular",
  Commission: "Commission",
  SpecialBonus: "Special Bonus",
  Reimbursement: "Reimbursement",
  Others: "Others",
};

/**
 * The income classes counted in the gross that SSS, PhilHealth and Pag-IBIG contributions are
 * bracketed from -- the same for every payroll frequency. Mirrors the API's
 * StatutoryHelper.NonStatutoryIncomeClasses (De Minimis, Reimbursement and Special Bonus are left
 * out); keep the two in step.
 */
export const STATUTORY_INCOME_CLASSES: readonly string[] = [
  "Regular",
  "Commission",
  "Others",
];

export const countsTowardStatutory = (
  incomeClass: string | null | undefined,
): boolean => !!incomeClass && STATUTORY_INCOME_CLASSES.includes(incomeClass);

/** Why a class is or isn't counted toward SSS / PhilHealth / Pag-IBIG, shown under the Income Class field. */
export const STATUTORY_NOTE: Record<string, string> = {
  Deminimis:
    "Not counted toward SSS, PhilHealth or Pag-IBIG: de minimis benefits are exempt.",
  Regular:
    "Counted toward SSS, PhilHealth and Pag-IBIG: it is part of the employee's regular pay.",
  Commission:
    "Counted toward SSS, PhilHealth and Pag-IBIG: commissions are part of the employee's pay.",
  SpecialBonus:
    "Not counted toward SSS, PhilHealth or Pag-IBIG: 13th-month-type bonuses are left out (they share the tax-free ceiling with the 13th month instead).",
  Reimbursement:
    "Not counted toward SSS, PhilHealth or Pag-IBIG: a refund of the employee's own expense isn't pay.",
  Others: "Counted toward SSS, PhilHealth and Pag-IBIG.",
};

export const STATUTORY_TAG = {
  COUNTED: "Counts for SSS · PhilHealth · Pag-IBIG",
  NOT_COUNTED: "Not counted for SSS · PhilHealth · Pag-IBIG",
} as const;

export const INCOME_CLASS_COLOR: Record<string, string> = {
  Deminimis: "cyan",
  Regular: "blue",
  Commission: "purple",
  SpecialBonus: "gold",
  Reimbursement: "geekblue",
  Others: "default",
};
