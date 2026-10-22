// Codes match hrms-api / tenantstore's CompanyClassification lists -- keep them in step.

export const CLASSIFICATION_LABEL = {
  INDUSTRY: "Industry",
  SUB_INDUSTRY: "Sub-industry",
  BUSINESS_TYPE: "Business Type",
  COMPANY_SIZE: "Company Size",
  HOW_DID_YOU_HEAR: "How did you hear about us?",
  HOW_DID_YOU_HEAR_OTHER: "Please tell us more",
  SECTION_CLASSIFICATION: "Business Classification",
  SELECT_INDUSTRY_FIRST: "Select an industry first",
};

export const BUSINESS_TYPE_OPTIONS = [
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "corporation", label: "Corporation" },
  { value: "cooperative", label: "Cooperative" },
  { value: "non-profit", label: "Non-profit / Foundation" },
  { value: "other", label: "Other" },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1,000 employees" },
  { value: "1000+", label: "More than 1,000 employees" },
];

export const ACQUISITION_OTHER_SOURCE = "other";

export const ACQUISITION_SOURCE_OPTIONS = [
  { value: "facebook", label: "Facebook / Social media" },
  { value: "google", label: "Google search" },
  { value: "referral", label: "Referral / Word of mouth" },
  { value: "event", label: "Event or seminar" },
  { value: ACQUISITION_OTHER_SOURCE, label: "Other" },
];
