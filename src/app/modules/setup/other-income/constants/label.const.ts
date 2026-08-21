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

export const INCOME_CLASS_COLOR: Record<string, string> = {
  Deminimis: "cyan",
  Regular: "blue",
  Commission: "purple",
  SpecialBonus: "gold",
  Reimbursement: "geekblue",
  Others: "default",
};
